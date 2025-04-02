---
date: '{{ .Date }}'
title: '{{ replace .File.ContentBaseName `-` ` ` | title }}'
draft: true
author: 
type: '{{ .Type }}'
---

## 