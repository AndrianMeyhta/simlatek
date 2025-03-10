<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/png" href="images/logosidoarjo.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>

<body>
    @inertia
</body>

</html>
