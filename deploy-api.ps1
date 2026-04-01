# Cloudflare Pages Direct Upload Script
# This script uploads static files directly to Cloudflare Pages

$apiToken = "cfut_41zvMcZrtL0NafJDaHTr8rzD6zk2QwNykipt7lu0c927ffaf"
$accountId = ""  # Will be fetched
$projectName = "bgremover"
$distPath = "dist"

# Headers
$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

# Step 1: Get Account ID
try {
    $accountsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Headers $headers -Method GET
    if ($accountsResponse.success -and $accountsResponse.result.Count -gt 0) {
        $accountId = $accountsResponse.result[0].id
        Write-Host "✓ Account ID: $accountId"
    } else {
        Write-Error "Failed to get account ID"
        exit 1
    }
} catch {
    Write-Error "Error getting account: $_"
    exit 1
}

# Step 2: Create or get project
try {
    $projectUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects"
    $projects = Invoke-RestMethod -Uri $projectUrl -Headers $headers -Method GET
    
    $project = $projects.result | Where-Object { $_.name -eq $projectName }
    
    if (-not $project) {
        Write-Host "Creating project: $projectName"
        $body = @{
            name = $projectName
            production_branch = "main"
        } | ConvertTo-Json
        
        $project = Invoke-RestMethod -Uri $projectUrl -Headers $headers -Method POST -Body $body
        Write-Host "✓ Project created"
    } else {
        Write-Host "✓ Project exists: $($project.name)"
    }
} catch {
    Write-Error "Error with project: $_"
    exit 1
}

# Step 3: Create deployment
Write-Host "Creating deployment..."
$deploymentUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$projectName/deployments"

# Get all files in dist
$files = Get-ChildItem -Path $distPath -Recurse -File
Write-Host "Uploading $($files.Count) files..."

# Create manifest
$manifest = @{}
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring((Resolve-Path $distPath).Path.Length + 1).Replace("\", "/")
    $content = [System.IO.File]::ReadAllBytes($file.FullName)
    $hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash($content)).Replace("-", "").ToLower()
    $manifest[$relativePath] = @{
        hash = $hash
        size = $file.Length
    }
}

$body = @{
    branch = "main"
    manifest = $manifest
} | ConvertTo-Json -Depth 10

try {
    $deployment = Invoke-RestMethod -Uri $deploymentUrl -Headers $headers -Method POST -Body $body
    Write-Host "✓ Deployment created"
    Write-Host "URL: https://$projectName.pages.dev"
} catch {
    Write-Error "Error creating deployment: $_"
}