type TaskConfig = TaskConfig.TaskConfig

namespace TaskConfig {
  export interface Theme {
    readonly color: string
    readonly backgroundColor: string
    readonly border: string
  }

  export interface TagConfig {
    // 标签的名字
    readonly name: string

    // 中文名，用于显示在 UI 上
    readonly label: string

    // 快捷键，一般为数字 1~9 对应的字符串，设置为 null 表示没有快捷键
    readonly shortcut: string

    // 标注按钮分组
    // 置空或 'default' 表示默认分组，按钮将直接显示在工具栏上
    // 其他字符串表示其他分组
    readonly group?:string

    // 标签的缩写，会显示在标注的文本的左侧
    readonly abbr: string

    readonly theme: Theme
    // TODO readonly darkTheme: Theme
  }

  export interface TaskConfig {
    readonly name: string
    readonly tags: ReadonlyArray<TagConfig>
  }
}

export default TaskConfig
