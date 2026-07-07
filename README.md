# 简介

本项目基于源规则仓库的规则文件转换生成
[Loon](https://www.nsloon.com/) 可直接导入的`.list`规则文件，只做格式转换，不修改规则数据本身。通过GitHub
Actions每天自动构建，保证规则最新。

## 说明

Clash Premium `RULE-SET` 规则文件使用如下格式：

```text
payload:
  - 'example.com'
  - 'example.org'
```

Loon 远程规则文件使用如下格式：

```text
DOMAIN-SUFFIX,example.com
DOMAIN-SUFFIX,example.org
```

构建任务会拉取源规则 `release` 分支的全部 `.txt` 文件，转换为同名 `.list` 文件。

## 规则文件地址

推荐优先使用 `raw.githubusercontent.com` 地址；如果无法访问
`raw.githubusercontent.com`，可以使用 `cdn.jsdelivr.net` 加速地址。CDN 内容
可能存在缓存延迟。

- **直连域名列表 direct.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/direct.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/direct.list`
- **代理域名列表 proxy.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/proxy.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/proxy.list`
- **广告域名列表 reject.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/reject.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/reject.list`
- **私有网络专用域名列表 private.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/private.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/private.list`
- **Apple 在中国大陆可直连的域名列表 apple.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/apple.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/apple.list`
- **iCloud 域名列表 icloud.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/icloud.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/icloud.list`
- **[慎用] Google 在中国大陆可直连的域名列表 google.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/google.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/google.list`
- **GFWList 域名列表 gfw.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/gfw.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/gfw.list`
- **非中国大陆使用的顶级域名列表 tld-not-cn.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/tld-not-cn.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/tld-not-cn.list`
- **Telegram 使用的 IP 地址列表 telegramcidr.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/telegramcidr.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/telegramcidr.list`
- **局域网 IP 及保留 IP 地址列表 lancidr.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/lancidr.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/lancidr.list`
- **中国大陆 IP 地址列表 cncidr.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/cncidr.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/cncidr.list`
- **需要直连的常见软件列表 applications.list**：
  - `https://raw.githubusercontent.com/tfannny/loon-rules/release/applications.list`
  - `https://cdn.jsdelivr.net/gh/tfannny/loon-rules@release/applications.list`

## 使用方式

详见: [使用方式](https://github.com/Loyalsoldier/clash-rules/blob/master/README.md#使用方式
)

## 引用

源规则仓库：[Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules)
