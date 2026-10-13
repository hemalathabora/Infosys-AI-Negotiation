Add-Type -AssemblyName System.Drawing

$src = "UI DESIGN/public/logo.png"

function Resize-Png([string]$source, [int]$width, [int]$height, [string]$destination) {
    $img = [System.Drawing.Image]::FromFile($source)
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    Write-Host "Generated: $destination ($width x $height)"
}

Resize-Png -source $src -width 192 -height 192 -destination "UI DESIGN/public/pwa-192x192.png"
Resize-Png -source $src -width 512 -height 512 -destination "UI DESIGN/public/pwa-512x512.png"
Resize-Png -source $src -width 180 -height 180 -destination "UI DESIGN/public/apple-touch-icon.png"
Resize-Png -source $src -width 512 -height 512 -destination "UI DESIGN/public/maskable-icon-512x512.png"
