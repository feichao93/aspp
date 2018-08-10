[![NPM Package](https://img.shields.io/npm/v/aspp.svg?style=flat-square)](https://www.npmjs.org/package/aspp)

# ASPP 中文标注工具

ASPP 中文标注工具，提供基于网页的标注前端，用来方便地对文本进行标注（实体标注为主）和查看标注结果；提供基于文件系统的文档管理后端模块，用于方便快速地创建和管理标注工程；标注工具的任务模块具有良好的拓展性，可以集成多种传统算法或机器学习/深度学习算法，提高标注效率。

**该工具部分功能已经可以使用，剩余功能仍在开发中。**

## 使用方法

1.  运行 `yarn global install aspp` 安装工具
2.  在*标注工程文件夹*内执行 `aspp serve` 运行工具后端
3.  打开 `http://localhost:1477` 在浏览器中进行标注，所有标注结果都会存放在*标注工程文件夹*中

**注意：请使用最新版 Chrome 浏览器**

完整文档 [/docs/readme.md](/docs/readme.md)

## 标注工程文件夹

aspp 的工作在*标注工程文件夹*中，该文件夹需要具有下列结构。文件夹可以参考 [_example/_](/packages/example/)。

```
<标注工程文件夹>:
  - aspp.config.yaml
  - docs/
    - folder/
      - f1.txt
    - a.txt
    - b.txt
  - annotations/
    - folder/
      - f1.txt.foo.json
    - a.txt.bar.json
    - b.txt.buzz.json
  - deleted/
    - some-deleted-file.json
```

_aspp.config.yaml_ 存放了该标注工程的配置：标签的种类、快捷键、标注样式等.

_docs/_ 文件夹下存放需要进行标注的文本文档。_docs/_ 支持嵌套的目录结构。

_annotations/_ 文件夹下存放标注的结果，一个文本文档可以对应多个标注文件，标注文件名格式为 `<文本文档的文件名>.<标注作者信息>.json`。标注文件所在目录会与文档的目录相对应，例如：`docs/folder1/f1.txt` 对应的标注文件为 `annotations/folder1/f1.txt.<author>.json`

_deleted/_ 文件夹下存放被删除的标注集合文件。
