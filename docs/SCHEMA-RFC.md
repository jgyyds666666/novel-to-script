# Novel-to-Script YAML Schema — RFC

> **状态**: Draft v0.1  
> **日期**: 2026-06-05  
> **作者**: Novel-to-Script Team

---

## 目录

1. [概述](#1-概述)
2. [设计原则](#2-设计原则)
3. [顶层结构](#3-顶层结构)
4. [元信息（meta）](#4-元信息meta)
5. [人物层（characters）](#5-人物层characters)
6. [结构层（structure）](#6-结构层structure)
7. [场景定义（scenes）](#7-场景定义scenes)
8. [内容块类型（content items）](#8-内容块类型content-items)
9. [原著追溯（source_ref）](#9-原著追溯source_ref)
10. [改编元信息层](#11-改编元信息层)
11. [完整示例](#12-完整示例)
12. [导出兼容性](#13-导出兼容性)
13. [未决问题与未来迭代](#14-未决问题与未来迭代)

---

## 1. 概述

### 1.1 问题域

小说与剧本是两种本质不同的叙事媒介。本 Schema 定义了一种中间格式，承载 AI 从小说**深度改写**后的剧本结构，同时保留：

- 与原著的字句级映射关系
- AI 改写决策的透明说明
- 需人工确认的不确定标记

### 1.2 目标脚本类型

本 Schema 通过**可选层级嵌套**支持三种目标格式：

| 类型 | 结构层级 | 典型时长 |
|------|---------|---------|
| 电影（movie） | Act → Sequence → Scene | 90–120 min |
| 电视剧（tv_series） | Season → Episode → (Cold Open) → Act → Scene | 30–60 min/ep |
| 短剧（short_drama） | Episode → Scene | 1–5 min/ep |

### 1.3 为什么选择 YAML

- **人类可读**：作者和开发者可以直接阅读、编辑
- **结构化明确**：层级关系通过缩进自然表达，比 JSON 更适合嵌套叙事结构
- **工具链友好**：绝大多数编程语言有成熟的 YAML 解析库；可无损转换为 JSON
- **编剧软件桥接**：YAML → Python 脚本 → .fountain / Final Draft XML 的转换路径清晰
- **版本控制友好**：纯文本，diff 清晰

---

## 2. 设计原则

### 原则 A：「可拍摄化」优先

Schema 的核心要求是：**AI 不能把小说叙述直接复制粘贴到 action 字段**。每一条 action 描述都应该是摄影机能捕捉的视听内容。不可拍摄的心理活动——如果 AI 无法合理转化为动作或对白——应标记为 `adaptation_note` 而非强行塞入场景。

### 原则 B：原著可溯

每个场景内容块都携带 `source_ref`，指向原文章节和段落。这允许作者在编辑剧本时**快速定位原著对应位置**，验证 AI 改写的合理性。

### 原则 C：不确定性透明

AI 在以下维度天然不确定：
- 对话归属推断（"嗯" 是谁说的？）
- 开放式结局的处理方向
- 大段时间跨度的场景切分方式
- 文化特定隐喻的可视化方案

这些不确定性**不应被隐藏**，而应通过 `uncertainty_flag` 显式标记，让作者能快速定位需要人工打磨的部分。

### 原则 D：人物先行

剧本的核心载体是人物的行动和对白。Schema 将人物小传独立为顶层元素，作为 AI 改写对白时保持人物语气一致性的"风格锚点"。这与 Fountain 和 Final Draft 的"Character"概念兼容。

### 原则 E：场景扁平化存储，结构层级化引用

所有场景存储在一个扁平列表中（便于导出和查找），结构层级（Act/Sequence/Scene tree）通过 ID 引用组织场景。这兼顾了：

- **机器处理**：扁平列表易于导出为 .fountain 等格式
- **人类阅读**：层级引用树呈现整体叙事结构
- **灵活性**：同场景可被不同版本的结构引用（未来扩展）

---

## 3. 顶层结构

```yaml
# 必填
meta:          # 元信息
characters:    # 人物小传列表
structure:     # 层级结构（引用场景 ID）
scenes:        # 扁平场景列表

# 可选
adaptation_notes:   # AI 改写说明
uncertainty_flags:  # 不确定标记
adaptation_report:  # 全局改编摘要
```

---

## 4. 元信息（meta）

```yaml
meta:
  # 剧本信息
  title: "剧本标题"                 # 必填，剧本名称
  script_type: movie               # 必填，枚举: movie | tv_series | short_drama

  # 原著信息
  source_title: "原著小说标题"       # 必填
  source_author: "原著作者"          # 可选
  source_chapters: 12              # 原著章节数

  # 语言
  language: zh-CN                  # 必填，BCP 47 语言标签，如 zh-CN, en-US

  # 版本与溯源
  version: "0.1.0"                 # Schema 版本
  generated_by: "novel-to-script"  # 生成工具标识
  generated_at: "2026-06-05T14:30:00Z"  # ISO 8601 时间戳
```

### 设计决策：为什么 script_type 是必填

AI 的改写策略因目标类型不同而有根本差异：
- 电影需要压缩时间线，强化三幕结构
- 电视剧需要在每集结尾设置悬念（cliffhanger）
- 短剧需要极快节奏，秒级吸引注意力

如果让 AI 自动推断类型，可能产生四不像的剧本结构。

---

## 5. 人物层（characters）

```yaml
characters:
  - id: char_wang_ling             # 必填，唯一标识符
    name: "王玲"                    # 必填，显示名称
    role: protagonist              # 必填，枚举
    aliases: ["玲姐", "阿玲"]       # 可选，别名/昵称（帮助 AI 识别对话归属）
    traits:                        # 必填，性格特征列表
      - "隐忍克制"
      - "观察力敏锐"
      - "对亲近的人易怒"
    arc: "从被动接受到主动反抗"      # 可选，角色弧光
    relationships:                 # 可选
      - to: char_zhang_wei         # 关联角色 ID
        type: "情人"               # 关系类型
        dynamic: "爱恨交织，相互试探" # 关系动态
    notes: "小说中她的动机在第 5 章才揭示" # 可选，编剧备注
    source_refs:                   # 可选，角色关键段落的原著引用
      - "ch1.p3"
      - "ch2.p7-p9"
```

### role 枚举

| 值 | 含义 |
|----|------|
| `protagonist` | 主角 |
| `antagonist` | 反派 / 对立面 |
| `supporting` | 配角 |
| `minor` | 次要角色 |

### 设计决策：为什么人物要带 source_refs

小说常常用大段文字刻画人物背景。这些原文是 AI 理解人物行为的核心输入，也是作者验证 AI 是否"读懂角色"的检查点。保留引用不会增加 Schema 复杂度（一个字符串列表），但在 AI 改写出错时能极大加速排查。

---

## 6. 结构层（structure）

结构层通过 ID 引用组织场景。三种脚本类型的结构不同：

### 6.1 电影（movie）

```yaml
structure:
  type: movie
  acts:
    - act: 1
      title: "建置"               # 可选，幕标题
      sequences:
        - sequence: 1
          title: "开场日常"       # 可选
          scene_ids: [scene_1, scene_2]
        - sequence: 2
          scene_ids: [scene_3, scene_4]
    - act: 2
      title: "对抗"
      sequences:
        - sequence: 3
          scene_ids: [scene_5, scene_6]
```

### 6.2 电视剧（tv_series）

```yaml
structure:
  type: tv_series
  seasons:
    - season: 1
      episodes:
        - episode: 1
          title: "第一集"
          cold_open:             # 可选，冷开场
            scene_ids: [scene_cold_1]
          acts:
            - act: 1
              scene_ids: [scene_1, scene_2]
            - act: 2
              scene_ids: [scene_3]
            - act: 3
              scene_ids: [scene_4, scene_5]
            - act: 4
              scene_ids: [scene_6]
```

### 6.3 短剧（short_drama）

```yaml
structure:
  type: short_drama
  episodes:
    - episode: 1
      title: "第一集"
      scene_ids: [scene_1]
    - episode: 2
      scene_ids: [scene_2, scene_3]
```

### 设计决策：为什么场景扁平存储+结构引用

**不在结构中内联场景内容**的原因是：

1. **导出简单**：扁平列表直接迭代即可生成 .fountain 或 FDX
2. **重组灵活**：结构调整（如把 Act 1 的某场景移到 Act 2）只需修改 ID 引用
3. **避免重复**：同一场景出现在不同版本的结构中（如"加长版"vs"剧场版"）只需引用同一个 `scene_id`
4. **机器友好**：其他编剧软件解析时，先定位所有场景，再按结构组织

---

## 7. 场景定义（scenes）

```yaml
scenes:
  - id: scene_1                          # 必填，全局唯一
    heading: "INT. 咖啡厅 - 下午"         # 必填，场景标题（兼容 Fountain 格式）
    location: "咖啡厅"                    # 可选，拍摄地点
    time_of_day: "下午"                   # 可选，日/夜/晨/昏
    interior: true                        # 可选，true=内景 false=外景
    characters_present:                   # 可选，出场人物
      - char_wang_ling
      - char_zhang_wei
    summary: "王玲在咖啡厅向张伟透露秘密"   # 可选，场景概要
    source_ref: "ch1.p5-p8"               # 可选，场景对应的原著段落范围
    content:                              # 必填，有序内容块列表
      - type: action
        # ... (见第8节)
```

### 设计决策：heading 格式

`heading` 采用影视行业通用的场景标题格式：

```
INT./EXT. 地点 - 时间
```

这与 Fountain 格式完全兼容，可以直接被 Final Draft、Fade In 等软件解析。

---

## 8. 内容块类型（content items）

场景的 `content` 是一个**有序列表**，每个元素是一个内容块。类型如下：

### 8.1 action — 动作描述

```yaml
- type: action
  text: "王玲推门走进咖啡厅，雨水顺着她的大衣滴落。她站在门口扫视了一圈，目光停在角落的张伟身上。"
  source_ref: "ch1.p5"
```

**改写要求**：`text` 必须是摄影机能拍摄的视听描述。禁止出现"她心想""他回忆起"等不可拍摄的心理活动。

### 8.2 dialogue — 对白

```yaml
- type: dialogue
  character: char_wang_ling              # 必填，说话者（角色 ID 或名称）
  line: "你真的要走吗？"                  # 必填，台词
  attribution_confidence: high           # 必填，AI 归属置信度
  delivery: "看着他，声音微微发颤"        # 可选，表演提示（parenthetical）
  source_ref: "ch1.p6"
```

#### attribution_confidence 枚举

| 值 | 含义 | 建议操作 |
|----|------|---------|
| `high` | 原文明确标注了说话者 | 无需处理 |
| `medium` | AI 通过上下文推断，有一定把握 | 建议作者快速确认 |
| `low` | AI 无法确定，仅做最佳猜测 | 作者必须确认 |

**设计决策：为什么 dialogue.character 接受名称而非强制 ID**

在小说中，某些对白可能归属于未在人物列表中出现的无名角色（如"路人甲""服务员"）。此时直接用名称字符串更灵活。但建议优先使用人物列表中的 `id`，以保持一致性。

### 8.3 voiceover — 画外音

```yaml
- type: voiceover
  character: char_wang_ling
  line: "那一天之后，我再也没见过他。有些话，错过就再也说不出口了。"
  source_ref: "ch3.p2"
  adaptation_rationale: "将原文的心理独白转化为画外音"  # 可选
```

### 8.4 montage — 蒙太奇

```yaml
- type: montage
  description: "接下来的三个月，张伟每天都去拳馆训练。"
  beats:                        # 蒙太奇中的子场景
    - "第一周：他在跑道上摔倒，膝盖流血"
    - "第二周：深夜，独自对着沙袋挥拳"
    - "第三个月：第一次完整打完三回合"
  music_suggestion: "节奏渐强的纯音乐"   # 可选
  source_ref: "ch5.p1-p3"
```

**设计决策：为什么要单独定义 montage 类型**

小说的"叙述性总结"（"接下来的三个月他每天..."）是改编中的经典难点。单独定义为 montage 类型让 AI 有明确的改写目标——将时间压缩的叙述转化为可视的蒙太奇片段序列，而不是勉强塞入单个场景的 action 中。

### 8.5 transition — 转场

```yaml
- type: transition
  value: "CUT TO:"              # 必填
  # 常见值: "CUT TO:", "FADE OUT.", "DISSOLVE TO:", "SMASH CUT TO:"
```

### 8.6 shot — 镜头指示（可选，细粒度控制）

```yaml
- type: shot
  shot_type: "CLOSE UP"         # 景别
  subject: "王玲的手"            # 拍摄对象
  description: "她的手指不自觉地摩挲着咖啡杯边缘"  # 镜头内动作
  source_ref: "ch1.p5"
```

**设计决策：shot 是可选类型**

大多数场景不需要镜头级指导——这是导演的工作。但当 AI 判断某个细节对叙事至关重要（如"她手上的婚戒不见了"——这是视觉线索但小说没有明说），可以插入 shot 块作为提示。默认不生成，高级用户可要求。

---

## 9. 原著追溯（source_ref）

### 9.1 格式

```
source_ref: "ch{章节号}.p{段落号}[-p{结束段落号}]"
```

| 示例 | 含义 |
|------|------|
| `ch1.p3` | 第 1 章第 3 段 |
| `ch2.p7-p9` | 第 2 章第 7 到 9 段 |
| `ch1.p3,ch1.p6` | 第 1 章第 3 段和第 6 段（多个不连续引用） |

### 9.2 使用位置

`source_ref` 可以出现在：
- **场景级别**：整个场景改编自某段原文
- **内容块级别**：每个 dialogue/action/voiceover 追溯其原文位置
- **人物级别**：人物关键段落的引用
- **adaptation_note 级别**：标记改写决策的原文依据

### 9.3 设计决策：为什么用"章+段落号"而非字符偏移

1. **版本健壮**：字符偏移在原文有任何修改后立即失效；章+段落号在小范围修改后仍然可用
2. **人类可读**：`ch3.p5` 比 `offset:1423` 直观
3. **分段可自动化**：段落分割是确定性的（空行分隔），不受编码影响

---

## 10. 改编元信息层

### 10.1 adaptation_notes — 改写说明

```yaml
adaptation_notes:
  - id: note_1
    source_ref: "ch1.p3"
    type: internal_monologue_conversion      # 改写类型
    original: "她内心涌起一阵复杂的情绪..."   # 原文片段
    converted_to: "摔杯子的动作 + 眼眶发红"   # 改写结果
    rationale: "心理描写无法拍摄，通过肢体动作和微表情外化情绪"  # 改写理由
    confidence: medium                       # AI 对此改写的自信度
```

#### type 枚举

| 值 | 含义 |
|----|------|
| `internal_monologue_conversion` | 心理活动转化 |
| `narrative_summary_adaptation` | 叙述性总结改编（如时间跨度压缩） |
| `description_to_action` | 环境/人物描写转化为动作 |
| `exposition_redistribution` | 背景信息重新分布（小说一次性交代 → 剧本分散在多场景） |
| `pacing_adjustment` | 节奏调整 |
| `dialogue_synthesis` | 对话合成（原文无对白，AI 根据情境生成） |
| `character_merging` | 角色合并 |
| `scene_splitting` | 场景拆分决策 |
| `other` | 其他 |

### 10.2 uncertainty_flags — 不确定标记

```yaml
uncertainty_flags:
  - id: flag_1
    source_ref: "ch8.p12"
    scene_ref: scene_25                     # 关联的场景 ID
    type: ending_ambiguity                  # 不确定类型
    severity: high                          # high | medium | low
    description: "原文为开放式结局。AI 选择了'主角离开'的方向，但也可以理解为'主角在等待'。"
    suggestions:                            # AI 提供的备选方案
      - "方向A：主角离开，暗示结束"
      - "方向B：主角留下，但表情暗示内心已离开"
```

#### type 枚举

| 值 | 含义 |
|----|------|
| `dialogue_attribution` | 对话归属不确定 |
| `ending_ambiguity` | 结局解读模糊 |
| `character_motivation` | 角色动机不明确 |
| `timeline_gap` | 时间线跳跃处理方式不确定 |
| `tone_shift` | 语气/风格转换点判断不确定 |
| `scene_boundary` | 场景切分位置不确定 |
| `dialogue_content` | 对白内容 AI 生成的置信度低 |
| `cultural_specific` | 文化特定内容，AI 可能误读 |

### 10.3 adaptation_report — 全局改编摘要

```yaml
adaptation_report:
  source_chapters_processed: 12
  total_scenes: 42
  total_characters: 8
  total_dialogue_lines: 312
  uncertainty_count: 5
  adaptation_note_count: 23
  generated_at: "2026-06-05T14:30:00Z"
  summary: |
    完成 12 章到 42 个场景的改编。
    主要改写策略：将大量心理描写转化为角色间冲突动作。
    5 处不确定标记需作者确认，集中在第 8 章结局和第 3 章对话归属。
```

---

## 11. 完整示例

下面是一个完整的短剧示例（1 集，1 个场景），展示所有核心字段：

```yaml
meta:
  title: "雨夜"
  script_type: short_drama
  source_title: "漫长的告别"
  source_author: "示例作者"
  source_chapters: 12
  language: zh-CN
  version: "0.1.0"
  generated_by: "novel-to-script"
  generated_at: "2026-06-05T14:30:00Z"

characters:
  - id: char_wang_ling
    name: "王玲"
    role: protagonist
    aliases: ["玲姐", "阿玲"]
    traits:
      - "隐忍克制"
      - "观察力敏锐"
    arc: "从被动接受到主动反抗"
    relationships:
      - to: char_zhang_wei
        type: "情人"
        dynamic: "爱恨交织"
    source_refs: ["ch1.p3", "ch2.p7-p9"]

  - id: char_zhang_wei
    name: "张伟"
    role: antagonist
    traits:
      - "沉默寡言"
      - "内心矛盾"
    arc: "从逃避到面对"
    relationships:
      - to: char_wang_ling
        type: "情人"
        dynamic: "爱恨交织"

structure:
  type: short_drama
  episodes:
    - episode: 1
      title: "第一集"
      scene_ids: [scene_1, scene_2]

scenes:
  - id: scene_1
    heading: "INT. 咖啡厅 - 下午"
    location: "咖啡厅"
    time_of_day: "下午"
    interior: true
    characters_present:
      - char_wang_ling
      - char_zhang_wei
    source_ref: "ch1.p5-p8"
    content:
      - type: action
        text: "王玲推门走进咖啡厅，雨水顺着她的大衣滴落。她站在门口扫视了一圈，目光停在角落的张伟身上。"
        source_ref: "ch1.p5"

      - type: dialogue
        character: char_wang_ling
        line: "你真的要走吗？"
        attribution_confidence: high
        delivery: "看着他，声音微微发颤"
        source_ref: "ch1.p6"

      - type: action
        text: "张伟看着窗外。雨越下越大，打在玻璃上发出密集的声响。他沉默了很久。"
        source_ref: "ch1.p6"

      - type: dialogue
        character: char_zhang_wei
        line: "嗯。"
        attribution_confidence: low
        source_ref: "ch1.p6"

      - type: transition
        value: "CUT TO:"

  - id: scene_2
    heading: "EXT. 咖啡厅外街道 - 傍晚"
    location: "咖啡厅外街道"
    time_of_day: "傍晚"
    interior: false
    characters_present:
      - char_wang_ling
    content:
      - type: action
        text: "王玲独自站在雨中，看着张伟的出租车消失在街角。雨水和泪水混在一起。"
        source_ref: "ch1.p8"

      - type: voiceover
        character: char_wang_ling
        line: "那一天之后，我再也没见过他。"
        source_ref: "ch3.p2"
        adaptation_rationale: "原文为心理独白，转化为画外音"

adaptation_notes:
  - id: note_1
    source_ref: "ch1.p6"
    type: internal_monologue_conversion
    original: "她内心涌起一阵复杂的情绪，既有愤怒，也有不舍..."
    converted_to: "通过'声音发颤'和沉默的时长暗示内心挣扎"
    rationale: "心理描写无法拍摄，通过演员的微表情和节奏传达"
    confidence: medium

  - id: note_2
    source_ref: "ch3.p2"
    type: narrative_summary_adaptation
    original: "那一天之后，她花了三年时间才明白..."
    converted_to: "简化为画外音一句带过，避免冗长闪回"
    rationale: "短剧格式需要快速推进，三年跨度压缩为蒙太奇或画外音"
    confidence: medium

uncertainty_flags:
  - id: flag_1
    source_ref: "ch1.p6"
    scene_ref: scene_1
    type: dialogue_attribution
    severity: low
    description: "'嗯。'的说话者，原文未明确标注，AI 推定为张伟。"
    suggestions:
      - "保持为张伟（符合上下文）"
      - "改为王玲（改变场景含义）"

adaptation_report:
  source_chapters_processed: 3
  total_scenes: 2
  total_characters: 2
  total_dialogue_lines: 3
  uncertainty_count: 1
  adaptation_note_count: 2
  generated_at: "2026-06-05T14:30:00Z"
  summary: "完成前 3 章到 2 个场景的试改编。主要挑战在于心理描写的视觉化。"
```

---

## 12. 导出兼容性

### 12.1 Fountain 格式

Fountain 是开源编剧标记语言，可被 Final Draft、Fade In、Highland 等软件导入。

本 Schema 的映射关系：

| YAML 字段 | Fountain | 说明 |
|-----------|----------|------|
| `heading` | 场景标题（`INT. XXX - DAY`） | 直接映射 |
| `action.text` | Action 段落 | 直接映射 |
| `dialogue.character` | Character 元素 | 直接映射 |
| `dialogue.line` | Dialogue 元素 | 直接映射 |
| `dialogue.delivery` | Parenthetical `(xxx)` | 包裹在括号中 |
| `transition.value` | Transition（`CUT TO:`） | 直接映射 |
| `voiceover` | Character `(V.O.)` | 角色名后加 `(V.O.)` |
| `montage` | 连续 Action 段落 + 注释 | 展开为多个 action 块 |

### 12.2 Final Draft XML (FDX)

FDX 格式更精细，可映射 `shot_type`、`interior/exterior` 等字段。具体映射方案在实现文档中定义。

---

## 13. 未决问题与未来迭代

### 13.1 待讨论

- [ ] **多版本场景**：同一场景是否需要支持多个改写版本（如"含蓄版"vs"直白版"）供作者选择？
- [ ] **配乐/音效层**：是否需要在 Schema 中加入 `sound` 内容块类型？
- [ ] **章节标记**：是否需要在结构中保留原著的章节边界（便于作者按章节验收）？

### 13.2 未来扩展方向

- **协作编辑元信息**：如果未来支持多作者协作，需要 `modified_by`、`comment` 等字段
- **分镜脚本扩展**：在现有 Schema 基础上增加 `storyboard` 层，支持 AI 生成分镜描述

---

> **变更记录**
> - 2026-06-05: RFC v0.1 初稿，确立核心结构和设计原则
