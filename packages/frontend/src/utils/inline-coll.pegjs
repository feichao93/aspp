Start = (Annotation / PlaceHolder / String)*

Annotation
  = '[' tag:Tag '/' entity:Entity ']' {
    return { tag, entity }
  }

PlaceHolder
  = '(' tag:Tag '/' entity:Entity ')' {
    return { placeholder: true, tag, entity }
  }

String
  = chars:StringChar+ { return chars.join('') }

// 注意 Tag 中不能包含斜杠
Tag = [^/]+ { return text() }

Entity = chars:EntityChar+ { return chars.join('') }

EntityChar
  = !('\\') [^\])] { return text() }
  / EscapingChar

StringChar
  = !('\\') [^[(] { return text() }
  / EscapingChar

EscapingChar
  = '\\' char:[[\]())/\\] { return char }
  / '\\' . { error('Invalid escape') }
