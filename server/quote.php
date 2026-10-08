<?php
declare(strict_types=1);

final class QuoteError extends RuntimeException {
    public function __construct(string $message, public int $status = 422) { parent::__construct($message); }
}
function textField(array $data, string $key, int $max, bool $required = false): string {
    $value = $data[$key] ?? '';
    if (!is_string($value) || !mb_check_encoding($value, 'UTF-8') || mb_strlen($value) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        throw new QuoteError('Hibás vagy túl hosszú mező: ' . $key);
    }
    $value = trim($value);
    if ($required && $value === '') throw new QuoteError('Hiányzó kötelező mező: ' . $key);
    return $value;
}
function choice(array $data, string $key, array $choices): string {
    $value = textField($data, $key, 100);
    if (!in_array($value, $choices, true)) throw new QuoteError('Érvénytelen választás: ' . $key);
    return $value;
}
function quoteBody(array $data, array $catalog): string {
    $contact = textField($data, 'contact', 120, true);
    $company = textField($data, 'company', 160, true);
    $phone = textField($data, 'phone', 40, true);
    $email = textField($data, 'email', 200, true);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) throw new QuoteError('Érvényes e-mail-címet adj meg.');
    $rows = $data['products'] ?? null;
    if (!is_array($rows) || count($rows) < 1 || count($rows) > 30) throw new QuoteError('1–30 terméktétel adható meg.');
    $lines = ['ÁRAJÁNLATKÉRÉS – CÉGFORMA', 'Az ajánlatkérés nem jelent megrendelést.', '', "Kapcsolattartó: $contact", "Cégnév: $company", "Telefonszám: $phone", "E-mail: $email", '', 'TERMÉKEK'];
    $total = 0;
    foreach (array_values($rows) as $i => $row) {
        if (!is_array($row)) throw new QuoteError('Hibás terméktétel.');
        $id = textField($row, 'id', 100, true);
        if ($id === 'other') {
            $name = textField($row, 'custom', 160, true);
            $color = textField($row, 'customColor', 100, true);
        } else {
            $product = $catalog[$id] ?? null;
            $code = textField($row, 'color', 100, true);
            if (!$product || !isset($product['colors'][$code])) throw new QuoteError('Ismeretlen termék vagy szín. Válaszd ki újra.');
            $name = $product['name'] . ' (cikkszám: ' . $product['sku'] . ')';
            $color = $product['colors'][$code];
        }
        $quantity = textField($row, 'quantity', 6, true);
        if (!ctype_digit($quantity) || (int)$quantity < 1 || (int)$quantity > 100000) throw new QuoteError('A darabszám 1–100000 közötti egész szám lehet.');
        $total += (int)$quantity;
        $sizes = textField($row, 'sizes', 1000) ?: 'Később egyeztetjük';
        array_push($lines, ($i + 1) . '. ' . $name, "Szín: $color", "Darabszám: $quantity", "Méretek: $sizes", '');
    }
    if ($total < 5) throw new QuoteError('Minimum összesen 5 darab szükséges.');
    $technology = choice($data, 'technology', ['', 'DTF nyomtatás', 'Hímzés', 'Segítséget kérek a választáshoz']);
    $placement = choice($data, 'placement', ['', 'Elöl', 'Hátul', 'Mindkét oldalon']);
    array_push($lines, "Összesen: $total darab", '', 'EMBLÉMÁZÁS', 'Technológia: ' . ($technology ?: 'Később egyeztetjük'), 'Minta helye: ' . ($placement ?: 'Később egyeztetjük'));
    foreach (['frontHeight' => ['Elöl', 'Elülső'], 'backHeight' => ['Hátul', 'Hátsó']] as $key => [$side, $label]) {
        $height = textField($data, $key, 10);
        if ($height !== '' && in_array($placement, [$side, 'Mindkét oldalon'], true)) {
            if (!preg_match('/^\d+(\.\d)?$/', $height) || (float)$height < 0.1 || (float)$height > 1000) throw new QuoteError('Érvénytelen grafikai magasság.');
            $lines[] = "$label grafika magassága: $height cm";
        }
    }
    $lines[] = 'MEGJEGYZÉS'; $lines[] = textField($data, 'notes', 5000);
    return implode("\n", $lines);
}
function safeSvg(string $content): bool {
    if (preg_match('/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)|@import|url\s*\(|expression\s*\(/i', $content)) return false;
    $doc = new DOMDocument();
    $previous = libxml_use_internal_errors(true);
    try {
        if (!$doc->loadXML($content, LIBXML_NONET) || $doc->documentElement?->localName !== 'svg') return false;
        $allowed = ['svg','g','defs','path','rect','circle','ellipse','line','polyline','polygon','text','tspan','title','desc','linearGradient','radialGradient','stop','clipPath','mask','symbol','use'];
        foreach ($doc->getElementsByTagName('*') as $node) {
            if (!in_array($node->localName, $allowed, true) || !in_array($node->namespaceURI, [null, 'http://www.w3.org/2000/svg'], true)) return false;
            foreach ($node->attributes as $attribute) {
                if (preg_match('/^on/i', $attribute->localName)) return false;
                if (in_array(strtolower($attribute->localName), ['href','src','base'], true) && !preg_match('/^#[A-Za-z_][\w.:-]*$/D', $attribute->value)) return false;
                if (preg_match('/javascript\s*:|data\s*:|https?\s*:|file\s*:/i', $attribute->value) && $attribute->namespaceURI !== 'http://www.w3.org/2000/xmlns/') return false;
            }
        }
        return true;
    } finally { libxml_clear_errors(); libxml_use_internal_errors($previous); }
}
function quoteFiles(array $files, array $data): array {
    if (!$files) return [];
    if (array_keys($files) !== ['artwork']) throw new QuoteError('Ismeretlen fájlmező.');
    $group = $files['artwork'];
    if (!is_array($group['name'] ?? null) || count($group['name']) > 5) throw new QuoteError('Legfeljebb 5 grafika csatolható.');
    $sides = $data['artworkSide'] ?? [];
    if (!is_array($sides)) throw new QuoteError('Hibás grafikai elhelyezés.');
    $result = []; $total = 0;
    foreach ($group['name'] as $i => $original) {
        $error = $group['error'][$i] ?? UPLOAD_ERR_NO_FILE;
        if ($error === UPLOAD_ERR_NO_FILE) continue;
        if ($error !== UPLOAD_ERR_OK) throw new QuoteError('A fájlfeltöltés nem sikerült. Ellenőrizd a fájlméretet, majd válaszd ki újra a fájlt.');
        $tmp = $group['tmp_name'][$i] ?? '';
        if (!is_string($tmp) || !is_uploaded_file($tmp)) throw new QuoteError('Érvénytelen feltöltés.');
        $size = filesize($tmp); $total += $size;
        if ($size < 1 || $size > 5 * 1024 * 1024 || $total > 10 * 1024 * 1024) throw new QuoteError('Fájlonként legfeljebb 5 MB, összesen 10 MB csatolható.');
        $original = textField(['name' => $original], 'name', 200, true);
        if (preg_match('/[\r\n]/', $original)) throw new QuoteError('Érvénytelen fájlnév.');
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
        $types = ['jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','pdf'=>'application/pdf','svg'=>'image/svg+xml'];
        if (!isset($types[$ext])) throw new QuoteError('JPG, PNG, PDF és SVG fájl csatolható.');
        if ($ext === 'svg') {
            if (!in_array($mime, ['image/svg+xml','application/xml','text/xml','text/plain'], true) || !safeSvg(file_get_contents($tmp))) throw new QuoteError('Az SVG aktív vagy nem támogatott tartalmat tartalmaz. Exportáld PDF vagy PNG formátumba.');
        } elseif ($mime !== $types[$ext]) throw new QuoteError('A fájl tartalma nem egyezik a kiterjesztésével.');
        if (in_array($ext, ['jpg','jpeg','png'], true) && !@getimagesize($tmp)) throw new QuoteError('Sérült képfájl.');
        $side = choice(['side' => $sides[$i] ?? 'Egyeztetendő'], 'side', ['Elöl','Hátul','Mindkét oldalon','Egyeztetendő']);
        $result[] = ['path'=>$tmp, 'name'=>'grafika-' . (count($result)+1) . '.' . $ext, 'original'=>$original, 'mime'=>$types[$ext], 'side'=>$side];
    }
    return $result;
}
function signToken(string $payload, string $ip, string $secret): string { return hash_hmac('sha256', $payload . '|' . $ip, $secret); }
function checkToken(string $token, string $ip, string $secret): string {
    if (!preg_match('/^(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/D', $token, $m)) throw new QuoteError('Frissítsd az oldalt, majd próbáld újra.', 403);
    $age = time() - (int)$m[1];
    if ($age < 0 || $age > 3600 || !hash_equals(signToken($m[1].'.'.$m[2], $ip, $secret), $m[3])) throw new QuoteError('A küldési munkamenet lejárt. Készíts új összesítőt.', 403);
    return $m[2];
}
