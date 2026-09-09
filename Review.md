# AIFFEL Campus Code Peer Review Templete
- 코더 : 정예빈
- 리뷰어 : 성현준


# PRT(Peer Review Template)
[x]  **1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요?**
- 문제에서 요구하는 기능이 정상적으로 작동하는지?
    - 해당 조건을 만족하는 부분의 코드 및 결과물을 근거로 첨부

README에 적어 두신 기능(대화로 식물 키우기 / 뿌리 강화 / 여정 / 캘린더 / 상점·보관함 / 로그인 동기화)이 실제로 전부 코드에 들어와 있었습니다. 화면 단위로도 `/`, `/journey`, `/calendar`, `/store`, `/item`, `/settings`, `/login` 이 모두 파일로 존재해서, 문서와 구현이 어긋나는 데가 없었어요.

가장 인상적이었던 건 **"AI가 없어도 게임이 멈추지 않게" 3단계로 대비해 둔 부분**입니다. `src/app/api/chat/route.ts` 의 POST 핸들러입니다.

```ts
// src/app/api/chat/route.ts:122-155
// 1) Preferred: AI SDK → AI Gateway (OIDC / AI_GATEWAY_API_KEY)
if (hasGatewayAuth()) {
  const gatewayReply = await callAiGateway(message, context);
  if (gatewayReply) {
    return NextResponse.json({ reply: gatewayReply, source: "ai-gateway" });
  }
}

// 2) Legacy fallback: direct Gemini API key
const geminiKey = process.env.GEMINI_API_KEY?.trim();
if (geminiKey) {
  const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const geminiReply = await callGeminiDirect(geminiKey, model, message, context);
  if (geminiReply) {
    return NextResponse.json({ reply: geminiReply, source: "gemini" });
  }
}

// 3) Local healing replies when no auth / provider failure
return NextResponse.json({
  reply: getFallbackReply(context),
  source: "fallback",
});
```

여기서 **폴백(fallback)** 은 "1순위가 실패하면 2순위, 그것도 실패하면 3순위로 내려가며 어떻게든 결과를 내주는 방식"을 말합니다. 이 코드는 ① Vercel AI Gateway → ② Gemini 키 직접 호출 → ③ 앱 안에 미리 써 둔 따뜻한 멘트, 순서로 내려갑니다. 그래서 **API 키가 없는 사람이 클론해서 실행해도 채팅이 그냥 됩니다.** 리뷰어가 키 없이 코드를 받아 봤을 때 "아, 이건 돌려볼 수 있는 앱이구나" 하고 바로 알 수 있는 설계라서, 완성도 측면에서 높게 봤습니다.

응답에 `source: "ai-gateway" | "gemini" | "fallback"` 을 같이 실어 보내는 것도 좋았습니다. 나중에 "지금 답이 AI가 준 건지 기본 멘트인지" 구분할 수 있어서, 디버깅할 때 두고두고 편할 장치예요.

프론트엔드에서도 한 번 더 방어하고 있었습니다.

```ts
// src/app/page.tsx:745-751
if (!response.ok) throw new Error("chat api failed");

const data = (await response.json()) as { reply?: string };
const reply = data.reply?.trim();
if (reply) return reply;
} catch {
  // fall through to local fallback
}
```

서버가 500을 내든 네트워크가 끊기든, `catch` 로 받아서 로컬 멘트로 이어 붙입니다. 사용자 입장에서 **에러 화면을 절대 안 보게 되는 구조**라, 힐링 앱이라는 콘셉트와도 잘 맞았습니다.

또 하나, `env.example` 을 보면 실제 키 자리를 `••••••` 로 가려 두셨습니다.

```bash
# env.example:12
# AI_GATEWAY_API_KEY=••••••••••••••••••••••••••••••••
```

키가 실수로 GitHub에 올라가는 사고가 정말 흔한데, 예시 파일에서부터 습관이 잡혀 있어서 이 부분은 그대로 배우고 싶었습니다.


[x]  **2. 핵심적이거나 복잡하고 이해하기 어려운 부분에 작성된 설명을 보고 해당 코드가 잘 이해되었나요?**
- 해당 코드 블럭에 doc string/annotation/markdown이 달려 있는지 확인
- 해당 코드가 무슨 기능을 하는지, 왜 그렇게 짜여진건지, 작동 메커니즘이 뭔지 기술.
- 주석을 보고 코드 이해가 잘 되었는지 확인
    - 잘 작성되었다고 생각되는 부분을 근거로 첨부합니다.

주석 개수 자체는 많지 않은데, **"헷갈릴 만한 곳에만" 정확히 달려 있어서** 오히려 읽기 편했습니다. 특히 파일을 열자마자 "이 파일이 무슨 책임을 지는가"를 알려주는 머리말 주석이 좋았어요.

```ts
// src/lib/plant-state.ts:1-4
/**
 * 홈 화면 화분(새싹)의 레벨/HP를 저장한다.
 * 게스트: localStorage / 로그인: localStorage + Supabase mind_game_state
 */
```

이 네 줄이 사실 이 프로젝트에서 제일 어려운 부분을 요약해 줍니다. 게스트는 브라우저에만 저장(localStorage = 브라우저가 가진 작은 저장 공간, 그 사람 그 브라우저에만 남습니다), 로그인하면 브라우저 + 서버 양쪽에 저장. 이 한 줄을 읽고 나서 `cloud-sync.ts` 를 봤더니 이해가 훨씬 빨랐습니다.

읽다가 "왜 이렇게 했지?" 하고 멈췄던 두 곳도, 바로 옆에 답이 있었습니다.

```ts
// src/lib/cloud-sync.ts:117
// DB 우선 + 채팅은 날짜별 더 긴 쪽 병합
```

```ts
// src/lib/cloud-sync.ts:182
/** 짧은 debounce로 연속 저장 요청을 묶음 */
export function scheduleCloudSave(delayMs = 800) {
```

**디바운스(debounce)** 는 "짧은 시간에 여러 번 들어온 요청을 마지막 하나로 합쳐서 한 번만 실행하는 기법"입니다. 채팅을 빠르게 여러 개 보내면 저장 요청이 그만큼 날아가는데, 0.8초 안에 들어온 건 묶어서 한 번만 보냅니다. 이 주석 한 줄이 없었으면 `setTimeout`/`clearTimeout` 코드를 보고 "왜 저장을 일부러 늦추지?" 하고 한참 헤맸을 것 같습니다.

기능의 의도를 설명한 주석도 좋았습니다.

```ts
// src/lib/sentiment.ts:165
/** 화분 표정 연출용 — love > angry > cry */
export type PlantMood = "none" | "cry" | "angry" | "love";
```

```ts
// src/lib/daily-quests.ts:110-113
/**
 * 일일 퀘스트를 완료 처리한다. 이미 완료된 퀘스트는 무시한다.
 * 완료 시 포션이 즉시 지급되고, 세 개를 모두 끝내면 보너스도 한 번 지급된다.
 */
export function completeDailyQuest(id: DailyQuestId): CompleteQuestResult {
```

특히 첫 번째 주석은 "우선순위가 love > angry > cry"라고 못 박아 뒀는데, 함수 본문이 정확히 그 순서로 되어 있습니다. 사랑 표현과 슬픔 표현이 한 문장에 같이 있을 때 뭘 보여줄지는 **정답이 없는 결정**인데, 그 결정을 주석으로 남겨 둔 거라서 좋은 주석이라고 봤습니다.

UI 쪽에도 "이건 실수로 지우면 안 되는 코드"라는 신호가 남아 있었습니다.

```ts
// src/app/page.tsx:847
// 모바일에서 input focus 시 화면 확대되는 것을 막기 위해 포커스하지 않음
```

이런 주석이 없으면 나중에 누가 "왜 전송 후에 입력창에 커서가 안 돌아오지? 버그네" 하고 고쳤다가 모바일이 다시 확대되는 일이 생깁니다. 실제로 겪어 보고 남긴 흔적 같아서 신뢰가 갔습니다.

한 가지만 덧붙이면, `src/lib/sentiment.ts` 의 `detectSentiment` 처럼 **게임 규칙의 핵심인 함수**에도 두세 줄 설명이 있으면 더 좋았을 것 같습니다. "긍정 단어만 있으면 positive, 부정 단어만 있으면 negative, 둘 다거나 둘 다 아니면 neutral" 이라는 규칙을 코드를 읽어서 역추적해야 했어요. 아래 5번 항목에서 이어서 제안드립니다.


[x]  **3. 에러가 난 부분을 디버깅하여 “문제를 해결한 기록”을 남겼나요? 또는 “새로운 시도 및 추가 실험”을 해봤나요?**
- 문제 원인 및 해결 과정을 잘 기록하였는지 확인
- 문제에서 요구하는 조건에 더해 추가적으로 수행한 나만의 시도, 실험이 기록되어 있는지 확인
    - 잘 작성되었다고 생각되는 부분을 캡쳐해 근거로 첨부합니다.

이 항목이 제일 좋았습니다. 별도 트러블슈팅 문서는 없지만, **커밋 히스토리 49개가 그대로 디버깅 일지 역할을 하고 있었습니다.** 커밋 메시지에 "무엇을 고쳤다"가 아니라 **"왜 그게 문제였는지"** 까지 적혀 있어서요.

가장 인상적인 기록 세 개를 옮깁니다.

**① 홈페이지가 멈추던 문제 (`bcf684c`)**

```
Fix hung homepage by dropping blocking auth middleware.

Keep store and item as home tabs so the plant stays on screen,
and stop Supabase session refresh from stalling every request.
```

원인을 "미들웨어가 모든 요청마다 Supabase 세션을 갱신하려고 해서 요청이 붙잡혀 있었다"로 짚고, 해결을 "미들웨어를 걷어냈다"로 적었습니다. **미들웨어(middleware)** 는 "페이지가 열리기 전에 모든 요청을 한 번 거쳐 가는 검문소" 같은 코드인데, 여기서 로그인 상태를 매번 확인하다가 전체가 느려진 상황입니다. 실제로 이 커밋에서 `src/middleware.ts` 와 `src/lib/supabase/middleware.ts` 두 파일이 삭제됐습니다 — 원인 진단과 조치가 코드로 정확히 맞아떨어집니다.

**② 레벨업이 식물을 시들게 만들던 논리 버그 (`4b7772d`)**

```
Only wilt the plant on negative input, not level-up HP reset.

Track negative-induced wilting separately so level-up resets
at 0 HP keep positive growth visuals and effects.
```

이게 정말 잡기 까다로운 종류의 버그입니다. HP가 100이 되면 레벨업하고 HP를 0으로 되돌리는데, 화면은 "HP 0 = 시들었음"으로 판단해서 **레벨업이라는 좋은 일이 일어난 직후에 "씨앗이 잠들었어요"** 라고 표시됐던 겁니다. 해결 방법도 깔끔합니다.

```ts
// 수정 전
function getPlantStatus(hp: number, level: number): string {
  if (hp === 0) return "씨앗이 잠들었어요… 긍정의 말로 다시 깨워 주세요";

// 수정 후 — src/app/page.tsx
function getPlantStatus(hp: number, level: number, wiltedByNegative: boolean): string {
  if (hp === 0 && wiltedByNegative) {
    return "씨앗이 잠들었어요… 긍정의 말로 다시 깨워 주세요";
  }
  ...
  if (hp === 0) {
    return `레벨 ${level} 달성! 긍정의 말로 키워 보세요`;
  }
```

"HP가 0"이라는 **하나의 숫자로 두 가지 다른 상황**(시들었다 / 레벨업했다)을 표현하려니 충돌이 났고, `wiltedByNegative` 라는 별도 표시를 하나 두어서 두 상황을 분리했습니다. 원인을 정확히 이해하고 고친 수정이라 근거로 첨부했습니다.

**③ 배포에서만 터진 타입 오류 (`158f150`)**

```
Fix journey Stage typing so production build passes.

Narrow terrain order lookup by realm to avoid a union indexOf
never error on Vercel.
```

로컬에서는 되는데 Vercel 배포 빌드에서만 실패하는, 초보자가 만나면 제일 막막한 상황입니다. `dd11747`(`restoring onSessionComplete prop`), `de7221f`, `88aea20`(라우팅) 까지 포함해 **배포 실패를 네 번 이상 정면으로 뚫은 기록**이 남아 있습니다.

**추가 실험으로 볼 수 있는 부분**도 있었습니다.

- `c803d5a` "Connect healing chatbot to Gemini API with **free-tier fallback**" — 무료 한도를 염두에 두고 폴백을 설계한 흔적
- `fbedce1` "Add **developer-only** unlimited potions and plant level reset" — 테스트를 편하게 하려고 개발자 전용 치트를 만든 것. `src/lib/dev-account.ts` 로 따로 분리해 두셨습니다
- `src/lib/root-strength.ts:30` 의 `readLegacyRootPoints()` — 저장 방식을 바꾸면서 **예전 방식으로 저장된 데이터도 읽어서 옮겨주는** 처리. 기존 플레이어의 진행도를 날리지 않으려는 배려라 눈에 띄었습니다


[ ]  **4. 회고를 잘 작성했나요?**
- 프로젝트 결과물에 대해 배운점과 아쉬운점, 느낀점 등이 상세히 기록 되어 있나요?
	- 딥러닝 모델의 경우, 인풋이 들어가 최종적으로 아웃풋이 나오기까지의 전체 흐름을 도식화하여 모델 아키텍쳐에 대한 이해를 돕고 있는지 확인

이 항목만 체크를 비워 뒀습니다. **잘못했다는 뜻이 아니라, 제가 받은 저장소 안에서는 회고 문서를 찾지 못했다는 뜻**입니다. 노드나 LMS에 따로 제출하셨다면 이 항목은 그쪽을 보고 채워져야 합니다.

저장소 기준으로 보면 `README.md` 가 회고 자리를 일부 대신하고 있습니다. 기획 의도("긍정의 말로 식물을 키우고, 부정의 감정은 안전하게 내려놓는")와 참고한 레퍼런스(동물의 숲)를 밝히고, 안전 안내까지 넣어 두신 부분은 회고에 들어갈 만한 내용이었습니다.

```markdown
> 이 앱은 의료·심리 상담을 대체하지 않습니다. 위기 상황에서는
> 1393(자살예방상담전화), 129(보건복지상담) 등 전문 기관의 도움을 받아 주세요.
```

감정을 다루는 앱에서 이 한 줄을 스스로 넣었다는 게, 만드는 사람이 사용자를 어디까지 생각했는지 보여준다고 느꼈습니다. 이 판단의 이유를 회고에 한 문단으로 적어 두시면 그 자체로 좋은 회고가 될 것 같아요.

혹시 회고를 저장소에 추가하실 생각이라면, 위 3번에서 정리한 세 개의 버그(멈추는 홈 화면 / 레벨업이 시들게 만든 버그 / 배포에서만 터진 타입 오류)를 **"무엇을 시도했고, 원인이 무엇이었고, 어떻게 알아냈는지"** 순서로 풀어 쓰기만 해도 충분히 상세한 회고가 됩니다. 이미 커밋 메시지에 재료가 다 들어 있어서, 새로 떠올릴 게 거의 없을 거예요.

또 README에 **"내가 말을 입력하면 → 감정을 판정하고 → HP/레벨이 변하고 → 화면 연출이 바뀌고 → 저장된다"** 는 흐름도 한 장이 있으면 좋겠습니다. 이 프로젝트는 딥러닝 모델은 아니지만, 입력에서 출력까지의 흐름이 여러 파일에 걸쳐 있어서(`page.tsx` → `sentiment.ts` → `plant-state.ts` → `cloud-sync.ts`) 그림 한 장의 효과가 클 것 같습니다.


[x]  **5. 코드가 간결하고 효율적인가요?**
- 파이썬 스타일 가이드 (PEP8)를 준수하였는지 확인
- 코드 중복을 최소화하고 범용적으로 사용할 수 있도록 모듈화(함수화) 했는지
    - 잘 작성되었다고 생각되는 부분을 근거로 첨부합니다.

먼저 짚고 갈 점: PEP8은 **파이썬용** 스타일 가이드라서 이 프로젝트(TypeScript/React)에는 해당하지 않습니다. 그래서 대신 프로젝트에 설정된 ESLint 규칙과 TypeScript 기준으로 봤습니다. `eslint.config.mjs` 로 규칙이 잡혀 있고, `package.json` 에 `"lint": "eslint"` 스크립트가 있고, 앞서 본 것처럼 **타입 오류를 만나면 우회하지 않고 실제로 고쳐서 빌드를 통과시킨 커밋**(`158f150`)이 있습니다. 규칙을 켜 놓고 실제로 지킨 셈이라 이 부분은 충족으로 봤습니다.

**모듈화는 특히 잘 되어 있었습니다.** `src/lib/` 아래에 20개 파일로 역할을 쪼개 두셨어요 — 감정 판정(`sentiment.ts`), 화분 상태(`plant-state.ts`), 뿌리(`root-strength.ts`), 퀘스트(`daily-quests.ts`), 포션(`potion.ts`), 인벤토리(`inventory.ts`), 클라우드 동기화(`cloud-sync.ts`)…. 파일 이름만 봐도 어디를 열어야 할지 알 수 있는 구조라, 처음 보는 저장소인데 길을 잃지 않았습니다.

재사용 관점에서 제일 좋았던 건 `applyHpGain` 입니다.

```ts
// src/app/page.tsx:624-651
function applyHpGain(gain: number, plantFxKind?: PlantFx) {
  let newHp = Math.min(MAX_HP, hp + gain);
  let newLevel = level;
  const hpIncreased = newHp > hp;
  let leveledUp = false;

  if (newHp >= LEVEL_UP_THRESHOLD) {
    newLevel = level + 1;
    newHp = 0;
    leveledUp = true;
    setWiltedByNegative(false);
    triggerWatering();
    flashHpGlow("up");
    playFx("bloom");
    playLevelUpFanfare();
    triggerLevelUpBurst(newLevel);
    maybeShowRootGuide(newLevel);
  } else if (hpIncreased) {
    ...
  }

  setHp(newHp);
  setLevel(newLevel);

  return { leveledUp, hpIncreased };
}
```

"HP가 오른다"는 사건에 딸린 것들(상한선 100 제한 / 레벨업 판정 / 물주기 애니메이션 / 반짝임 / 효과음 / 축하 연출 / 뿌리 가이드 첫 안내)을 **한 함수 안에 다 모아** 두셨습니다. 그래서 채팅으로 긍정의 말을 했을 때, 화분을 터치했을 때, 어디서 HP가 올라도 연출이 항상 똑같이 나옵니다. 이런 걸 각 호출 지점에 흩어 놓으면 "채팅으로 레벨업할 때는 효과음이 나는데 화분 터치로 레벨업하면 안 나는" 버그가 반드시 생기는데, 그 위험을 구조적으로 없앤 부분이라 높게 봤습니다.

숫자를 코드에 박아 넣지 않고 이름을 붙여 둔 것도 좋았습니다.

```ts
// src/app/page.tsx:50-54
const MAX_HP = 100;
const HP_GAIN = 15;
const HP_LOSS = 18;
const HP_POT_GAIN = 5;
const LEVEL_UP_THRESHOLD = MAX_HP;
```

밸런스를 조절하고 싶을 때 이 다섯 줄만 만지면 됩니다. 부정 감정의 감소폭(18)을 긍정의 증가폭(15)보다 살짝 크게 잡은 것도 의도가 읽혀서 좋았어요.

아쉬운 점도 두 가지만 남깁니다. 둘 다 아래 "코드 개선" 항목에 구체적으로 적어 두었습니다.

1. `formatDateKey` 함수가 세 파일에 똑같이 중복 구현되어 있습니다 (`chat-history.ts:14`, `mood-log.ts:52`, `root-strength.ts:23`).
2. `src/components/BackgroundPreview.tsx` 가 1,935줄입니다. 배경 씬이 10개 넘게 한 파일에 들어 있어서, 배경 하나만 손보려 해도 파일 전체를 열어야 합니다.


# 참고 링크 및 코드 개선

## 1.코드 리뷰 시 참고한 링크가 있다면 링크와 간략한 설명을 첨부합니다.

- **Supabase — Row Level Security**: https://supabase.com/docs/guides/database/postgres/row-level-security
  아래 개선 제안 ②의 근거로 확인한 공식 문서입니다. RLS를 켜는 문법과, "정책을 안 만들면 아무도 못 읽는다 / RLS를 안 켜면 누구나 읽는다"는 동작 차이가 정리돼 있습니다.
- **Vercel AI SDK**: https://ai-sdk.dev/
  `generateText` 와 `providerOptions.gateway` 사용법을 확인했습니다. 정예빈님이 `route.ts:53-57`에서 `tags: ["feature:healing-chat", "app:my-mind-01"]` 로 태그를 붙여 두신 게 문서 권장 방식과 맞는지 보려고 참고했고, 맞았습니다.

## 2.코드 리뷰를 통해 개선을 제안할 코드가 있다면 코드와 간략한 설명을 첨부합니다.

### ① `formatDateKey` 중복 — 한 곳으로 모으기

지금 똑같은 함수가 세 파일에 각각 들어 있습니다.

```ts
// src/lib/chat-history.ts:14
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// src/lib/mood-log.ts:52 — 같은 내용
// src/lib/root-strength.ts:23 — 같은 내용 (변수명만 year/month/day)
```

`daily-quests.ts:1` 은 이미 `chat-history` 에서 가져다 쓰고 있어서, 나머지 두 곳도 같은 방식으로 바꾸시면 됩니다.

```ts
// src/lib/mood-log.ts, src/lib/root-strength.ts 맨 위에
import { formatDateKey } from "./chat-history";
// 그리고 각 파일의 formatDateKey 함수 정의를 삭제
```

**왜 신경 쓸 만한가** — 이 함수는 "오늘 날짜를 `2026-09-09` 같은 문자열로 만드는" 함수인데, 이 문자열이 **채팅 기록·감정 기록·뿌리 기록·퀘스트의 저장 키**로 다 쓰입니다. 세 군데 중 한 곳만 나중에 살짝 달라지면(예: 어디는 UTC 기준, 어디는 한국 시간 기준) **같은 날인데 기록이 다른 날짜로 흩어지는** 버그가 생기고, 이건 원인을 찾기가 정말 어렵습니다. 지금은 세 구현이 똑같으니 문제가 없지만, 하나로 합쳐 두면 앞으로도 어긋날 수가 없어집니다.

> 참고로 세 함수 모두 `getFullYear()` 같은 로컬 시간 기준을 쓰고 있어서 지금 동작은 안전합니다. `toISOString().slice(0,10)` 으로 바꾸는 건 오히려 위험한데, 그건 UTC 기준이라 밤 9시 이후에 쓴 기록이 다음 날로 넘어가 버립니다. 지금 방식이 맞습니다.

### ② `supabase/mind_schema.sql` 에 RLS 정책 추가

README에는 이렇게 적어 두셨습니다.

```markdown
데이터베이스 스키마는 `supabase/mind_schema.sql`을 참고하세요.
각 사용자는 자신의 프로필·게임 상태만 읽고 쓸 수 있습니다.
```

그런데 `supabase/mind_schema.sql` 은 테이블 두 개를 만드는 것으로 끝나 있고(전체 19줄), RLS 관련 구문이 없습니다.

**RLS(Row Level Security)** 는 "로그인한 사람이 자기 데이터 줄만 읽고 쓸 수 있게 데이터베이스가 직접 막아주는 기능"입니다. 이게 없으면 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 는 이름 그대로 브라우저에 공개되는 키라서, 그 키를 아는 사람이 **다른 사람의 `chat_logs`(감정 대화 기록)를 그대로 읽어갈 수 있습니다.** 감정 일기가 담긴 앱이라 특히 민감한 부분이라 짚어 드립니다.

Supabase 대시보드에서 직접 정책을 걸어 두셨을 수도 있는데, 그 경우에도 **SQL 파일에 같이 적어 두시는 걸 권합니다.** 나중에 새 프로젝트에 이 스키마를 다시 실행하면 테이블만 생기고 보호는 빠진 상태가 되기 때문입니다.

```sql
-- supabase/mind_schema.sql 아래에 추가

alter table public.mind_profiles enable row level security;
alter table public.mind_game_state enable row level security;

-- mind_profiles: 자기 줄만
create policy "mind_profiles: own row select"
  on public.mind_profiles for select
  using (auth.uid() = user_id);

create policy "mind_profiles: own row insert"
  on public.mind_profiles for insert
  with check (auth.uid() = user_id);

create policy "mind_profiles: own row update"
  on public.mind_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- mind_game_state: 자기 줄만
create policy "mind_game_state: own row select"
  on public.mind_game_state for select
  using (auth.uid() = user_id);

create policy "mind_game_state: own row insert"
  on public.mind_game_state for insert
  with check (auth.uid() = user_id);

create policy "mind_game_state: own row update"
  on public.mind_game_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

`auth.uid()` 는 "지금 요청을 보낸 로그인 사용자의 id"입니다. `auth.uid() = user_id` 라고 걸어 두면 자기 줄 외에는 아예 조회 결과에 나오지 않습니다.

`cloud-sync.ts` 는 `upsert` 로 저장하는데(`upsert` = 없으면 넣고 있으면 덮어쓰기), insert와 update 두 경우가 다 필요해서 정책을 둘 다 만들어 뒀습니다. **주의**: 이 SQL을 실행한 직후에는 정책이 제대로 안 걸려 있으면 앱에서 저장·불러오기가 안 되는 것처럼 보일 수 있으니, 로컬에서 로그인해서 저장이 되는지 한 번 확인하신 뒤에 배포하시면 좋겠습니다.

### ③ `detectSentiment` — 긍정과 부정이 한 문장에 같이 있을 때

지금 로직입니다.

```ts
// src/lib/sentiment.ts:136-143
export function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  const pos = POSITIVE_WORDS.some((w) => t.includes(w));
  const neg = NEGATIVE_WORDS.some((w) => t.includes(w));
  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  return "neutral";
}
```

`some` 은 "하나라도 포함되면 true"라서, 긍정 단어와 부정 단어가 **둘 다** 있으면 `neutral` 이 됩니다. 그러면 이런 문장이:

> "오늘 진짜 **힘들**었는데, 그래도 **감사**한 일이 하나 있었어"

`neutral` 로 판정되어 화분이 자라지도, 시들지도 않습니다. 그런데 이 문장은 이 앱이 가장 응원하고 싶은 종류의 말이기도 합니다 — 힘든 일 안에서 감사를 찾는 건 정예빈님이 만든 **"뿌리 강화"(후회를 감사로 바꾸기)와 정확히 같은 결**이니까요.

단어 **개수**를 세서 더 많은 쪽을 따라가게 하면, 지금 구조를 거의 그대로 두면서 이 문장을 `positive` 로 잡을 수 있습니다.

```ts
export function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  const posCount = POSITIVE_WORDS.filter((w) => t.includes(w)).length;
  const negCount = NEGATIVE_WORDS.filter((w) => t.includes(w)).length;

  if (posCount === 0 && negCount === 0) return "neutral";
  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral"; // 개수가 같으면 판단 보류
}
```

`some`(있냐 없냐) 을 `filter(...).length`(몇 개냐) 로만 바꾼 것이고, 반환 타입도 그대로라 다른 파일은 손댈 필요가 없습니다.

다만 이건 **정답이 있는 문제가 아닙니다.** "힘들지만 감사해"를 성장으로 볼지, 판단을 보류할지는 기획의 몫이에요. 지금처럼 `neutral` 로 두는 것도 "섣불리 판정하지 않는다"는 존중의 표현일 수 있습니다. 그래서 이건 버그 제보가 아니라 **한 번 정해 보시면 좋겠다는 제안**으로 남깁니다. 어느 쪽으로 정하시든, 그 판단을 `detectSentiment` 위에 주석 두 줄로 적어 두시면 2번 항목에서 말씀드린 아쉬움까지 같이 해결됩니다.


# 총평

**클론해서 바로 돌려볼 수 있는 앱**을 만드셨다는 게 가장 큰 강점입니다. API 키가 없어도 채팅이 되고, 로그인을 안 해도 게스트로 플레이가 되고, 서버가 실패해도 에러 화면이 안 뜹니다. "안 되는 상황"을 하나하나 미리 막아 둔 건 코드를 잘 쓰는 것과는 또 다른 능력이라, 이 부분은 그대로 배워 가겠습니다.

커밋 49개를 따라 읽는 게 이번 리뷰에서 제일 재미있었습니다. 씨앗 이미지 크기를 반으로 줄이고, 화분을 바닥에 붙이고, 모바일에서 입력창 확대를 막고, 배포 빌드를 네 번 뚫고 — 하나하나가 "실제로 해보고 고친" 흔적이었습니다. 특히 `4b7772d` 에서 **"HP 0"이 시든 상태와 레벨업 직후를 동시에 뜻하고 있다**는 걸 알아채고 `wiltedByNegative` 를 분리해 낸 부분은, 증상만 가리지 않고 원인을 정확히 찾은 수정이었습니다.

구조도 좋았습니다. `src/lib/` 에 역할별로 20개 파일을 나눠 두셔서 처음 보는 저장소인데도 길을 잃지 않았고, `applyHpGain` 처럼 "한 사건에 딸린 모든 연출을 한 함수에 모으는" 방식은 앞으로 연출이 더 늘어나도 안 깨질 설계였습니다.

보완하면 좋을 건 세 가지입니다. **첫째, `mind_schema.sql` 의 RLS.** README에 약속한 "각자 자기 데이터만"이 SQL 파일에는 안 들어가 있어서, 감정 기록을 다루는 앱인 만큼 이건 우선순위를 높게 두시면 좋겠습니다. **둘째, 회고 문서.** 이미 커밋 메시지에 재료가 다 있으니, 위 세 개의 버그를 "원인 → 어떻게 알아냈는지" 순서로 옮겨 적기만 해도 충분합니다. **셋째, 1,935줄이 된 `BackgroundPreview.tsx`** 는 배경 씬 단위로 파일을 쪼개 두시면 나중에 배경을 더 넣기가 훨씬 편해질 거예요.

마지막으로, 코드 외의 이야기를 하나 하고 싶습니다. 감정을 다루는 앱을 만들면서 **"이 앱은 의료·심리 상담을 대체하지 않습니다"** 라는 안내와 1393·129 번호를 스스로 넣으셨고, 시스템 프롬프트에도 위기 신호가 보이면 전문 기관을 안내하라는 규칙(`healing-bot.ts:62-63`)을 넣어 두셨습니다. 아무도 요구하지 않았을 부분인데 먼저 챙기신 게, 이 프로젝트에서 제일 인상 깊었습니다. 잘 만든 앱을 넘어 **책임감 있게 만든 앱**이었습니다. 리뷰하면서 많이 배웠습니다, 감사합니다.
