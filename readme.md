[![NPM Package](https://img.shields.io/npm/v/aspp.svg?style=flat-square)](https://www.npmjs.org/package/aspp)

**WIP 该工具仍在开发中**

# Annotation Set Processing Platform

中文标注工具，提供基于网页的标注前端，用来方便地对文本进行标注和查看标注结果；提供基于文件系统的文档管理后端模块，用于方便快速地创建和管理标注任务；该工具提供了外部算法获取用户交互的接口，方便不同工具集成不同的机器学习算法/深度学习算法，提高标注效率。

## 使用方法

1.  运行 `yarn global install aspp` 安装工具
2.  在*标注任务文件夹*内执行 `aspp serve` 运行工具后端
3.  打开 `localhost:1477` 在浏览器中进行标注，所有标注结果都会存放在*标注任务文件夹*中

## 标注任务文件夹

aspp 的工作在*标注任务文件夹*中，该文件夹需要具有下列结构。文件夹可以参考 [_example/_](/example/)。

```
<task-dir>:
  - aspp.config.yaml
  - docs/:         (可选)
    -- a.txt
    -- b.txt
  - annotations/:  (可选)
    -- a.txt.foo.yaml
    -- b.txt.bar.yaml
```

_aspp.config.yaml_ 存放了该标注任务的配置：标签的种类、快捷键、标注样式等.

_docs/_ 文件夹下存放需要进行标注的文本文档.

_annotations/_ 文件夹下存放标注的结果，一个文本文档可以包含多个标注结果文件，标注结果的文件名格式为 `<文本文档的文件名>.<标注作者信息>.yaml`.
