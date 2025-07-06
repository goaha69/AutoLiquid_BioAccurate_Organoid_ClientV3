# PowerShell script: tools/slot-fix.ps1
# ------------------------------------------------------------
# 批量将 Vue2 旧插槽语法
#   <span #slotName #default="args"> ... </span>
#   <template #slotName #default="args">
# 替换为 Vue3 语法：
#   <template #slotName="{ args }"> <span>...</span> </template>
# ------------------------------------------------------------
# 使用方式：
#   1. 打开 PowerShell，cd 到仓库根目录
#   2. 执行:  powershell -ExecutionPolicy Bypass -File .\tools\slot-fix.ps1
#   3. 运行完毕后重新 npm run dev 检查编译即可

Write-Host "[slot-fix] 开始批量替换 slot 语法..." -ForegroundColor Cyan

# 遍历 src 目录下所有 .vue 文件，忽略 backups 目录
Get-ChildItem -Path "src" -Recurse -Include *.vue | Where-Object { $_.FullName -notmatch "backups" } | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw

    # 1) <span #foo #default="a,b">...</span>  =>  <template #foo="{ a,b }"><span>...</span></template>
    $patternSpan = '(?s)<span\s+#([A-Za-z0-9_]+)\s+#default="([^"]+)"\s*>(.*?)<\/span>'
    $replacementSpan = '<template #$1="{ $2 }"><span>$3</span></template>'
    $content = [regex]::Replace($content, $patternSpan, $replacementSpan)

    # 2) <template #foo #default="args">  =>  <template #foo="{ args }">
    $patternTpl = '<template\s+#([A-Za-z0-9_]+)\s+#default="([^"]+)"\s*>'
    $replacementTpl = '<template #$1="{ $2 }">'
    $content = [regex]::Replace($content, $patternTpl, $replacementTpl)

    # 如果内容发生变化则写回文件
    if ($content -ne (Get-Content $file -Raw)) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "[slot-fix] 已处理: $file" -ForegroundColor Green
    }
}

Write-Host "[slot-fix] 执行完毕！" -ForegroundColor Cyan 