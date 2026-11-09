$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080
$prefix = "http://127.0.0.1:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Site: $prefix"
Write-Host "Folder: $root"
Write-Host "Press Ctrl+C to stop."

Start-Process $prefix

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  $relativePath = [System.Uri]::UnescapeDataString($request.Url.LocalPath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  }

  $filePath = Join-Path $root ($relativePath -replace "/", [IO.Path]::DirectorySeparatorChar)

  if (Test-Path $filePath -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    switch ([IO.Path]::GetExtension($filePath).ToLower()) {
      ".html" { $response.ContentType = "text/html; charset=utf-8" }
      ".css"  { $response.ContentType = "text/css; charset=utf-8" }
      ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
      ".mp4"  { $response.ContentType = "video/mp4" }
      ".mp3"  { $response.ContentType = "audio/mpeg" }
      default { $response.ContentType = "application/octet-stream" }
    }
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
    $message = [Text.Encoding]::UTF8.GetBytes("Not found: $relativePath")
    $response.OutputStream.Write($message, 0, $message.Length)
  }

  $response.Close()
}
