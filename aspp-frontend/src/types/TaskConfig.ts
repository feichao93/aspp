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

    // 标注按钮的显示类别
    // primary 表示直接显示对应的按钮
    // secondary 表示将按钮放到「更多标签」的下拉列表中   readonly category: 'primary' | 'secondary'
    readonly category: 'primary' | 'secondary'

    // 标签的缩写，会显示在标注的文本的左侧
    readonly abbr: string

    readonly theme: Theme
    readonly darkTheme: Theme
  }

  export interface TaskConfig {
    readonly name: string
    readonly tags: ReadonlyArray<TagConfig>
  }
}

export default TaskConfig
