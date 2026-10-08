<?php
// Másold a nyilvános webgyökéren KÍVÜLRE. Ne kerüljön Gitbe vagy a dist-be.
return [
    'enabled' => false, // Csak ellenőrzött tárhely és végleges tájékoztatók mellett true.
    'origin' => 'https://cegforma.hu',
    'secret' => '', // php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
    'private_dir' => '/ABSOLUTE/PRIVATE/PATH/cegforma-state',
    'smtp_host' => '',
    'smtp_port' => 587,
    'smtp_security' => 'tls', // tls (587) vagy ssl (465); hitelesített TLS kötelező.
    'smtp_username' => '',
    'smtp_password' => '',
    'from_email' => '', // Saját domainen hitelesített feladó, nem a látogató címe.
    'development' => false, // Kizárólag helyi, loopback SMTP-teszthez.
];
