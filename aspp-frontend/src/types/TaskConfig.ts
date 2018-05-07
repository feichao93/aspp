type TaskConfig = TaskConfig.TaskConfig

namespace TaskConfig {
  export interface Theme {
    readonly color: string
    readonly backgroundColor: string
    readonly border: string
  }

  export interface TagConfig {
    readonly name: string
    readonly label: string
    readonly ui: 'button' | 'drop-down'
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
