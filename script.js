const form = document.getElementById("hearingForm");
const resultSection = document.getElementById("resultSection");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
const copyButton = document.getElementById("copyButton");
const copyMessage = document.getElementById("copyMessage");

const summaryTheme = document.getElementById("summaryTheme");
const summaryType = document.getElementById("summaryType");
const summaryBusiness = document.getElementById("summaryBusiness");
const summaryProblem = document.getElementById("summaryProblem");
const summarySupport = document.getElementById("summarySupport");

const questionList = document.getElementById("questionList");
const checkList = document.getElementById("checkList");
const actionList = document.getElementById("actionList");
const expertBlock = document.getElementById("expertBlock");
const expertList = document.getElementById("expertList");

let latestSheetText = "";

const typeQuestions = {
  "AI活用相談": [
    "現在の仕事の中で、時間がかかっている作業は何か聞いてみる",
    "文章作成、SNS投稿、資料作成など、AIを試したい場面を確認する",
    "AIを使ううえで不安に感じていることを聞いてみる"
  ],
  "LP・Web制作相談": [
    "LPで伝えたい商品・サービスの強みを聞いてみる",
    "LPを見た人に取ってほしい行動を確認する",
    "既存のWebサイトや参考にしたいページがあるか確認する"
  ],
  "SNS発信相談": [
    "現在使っているSNSと投稿頻度を確認する",
    "届けたい相手と、投稿で伝えたい内容を聞いてみる",
    "続けにくい理由や負担になっている作業を整理する"
  ],
  "業務整理・効率化相談": [
    "毎週くり返している作業を聞いてみる",
    "手作業、二重入力、確認待ちが多い作業を確認する",
    "効率化したい理由と、優先したい業務を整理する"
  ],
  "その他": [
    "今回の相談で一番整理したいことを聞いてみる",
    "現状で困っている場面を具体的に確認する",
    "相談後にどのような状態になっていたいか聞いてみる"
  ]
};

const typeChecks = {
  "AI活用相談": [
    "AIに入力してはいけない個人情報や機密情報の範囲",
    "最初に試せる小さな作業",
    "社内や関係者に確認が必要な利用ルール"
  ],
  "LP・Web制作相談": [
    "掲載する情報の範囲と公開してよい内容",
    "問い合わせ先や申込み方法の有無",
    "写真、ロゴ、実績など使用できる素材"
  ],
  "SNS発信相談": [
    "投稿に使ってよい写真や事例の範囲",
    "発信の目的と優先したいSNS",
    "投稿作成に使える時間"
  ],
  "業務整理・効率化相談": [
    "現在使っているツールや紙の書類",
    "効率化しても変えたくない業務の進め方",
    "個人情報や機密情報を扱う作業の有無"
  ],
  "その他": [
    "今回の相談で扱う範囲",
    "公開してよい情報と伏せるべき情報",
    "次回までに確認できる資料やメモ"
  ]
};

const expertKeywords = [
  "医療",
  "治療",
  "診断",
  "法律",
  "契約",
  "訴訟",
  "税務",
  "確定申告",
  "税金",
  "労務",
  "雇用",
  "給与",
  "投資",
  "金融",
  "許認可",
  "許可",
  "補助金"
];

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = {
    theme: cleanText(formData.get("theme")),
    business: cleanText(formData.get("business")),
    problem: cleanText(formData.get("problem")),
    support: cleanText(formData.get("support")),
    consultationType: cleanText(formData.get("consultationType"))
  };

  const sheet = buildHearingSheet(data);
  renderSheet(data, sheet);
  latestSheetText = buildCopyText(data, sheet);

  emptyState.hidden = true;
  resultContent.hidden = false;
  copyMessage.textContent = "";
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("reset", () => {
  emptyState.hidden = false;
  resultContent.hidden = true;
  latestSheetText = "";
  copyMessage.textContent = "";
});

copyButton.addEventListener("click", async () => {
  if (!latestSheetText) {
    copyMessage.textContent = "先にヒアリングシートを作成してください。";
    return;
  }

  const copied = await copyText(latestSheetText);
  copyMessage.textContent = copied
    ? "生成結果をコピーしました。共有前に個人情報や機密情報が含まれていないか確認してください。"
    : "コピーできませんでした。結果を選択して手動でコピーしてください。";
});

function buildHearingSheet(data) {
  const commonQuestions = [
    `「${data.theme}」について、今回の相談で一番整理したいことを聞いてみる`,
    `「${data.business}」の現在の状況と、相談に至ったきっかけを確認する`,
    `「${data.problem}」について、特に困っている場面を聞いてみる`,
    `「${data.support}」に近づくために、最初に試したいことを整理する`
  ];

  const questions = uniqueItems([
    ...commonQuestions,
    ...(typeQuestions[data.consultationType] || typeQuestions["その他"])
  ]).slice(0, 7);

  const checks = uniqueItems([
    "相談で扱う範囲と、今回は扱わない範囲",
    "公開してよい情報と、伏せるべき情報",
    ...(typeChecks[data.consultationType] || typeChecks["その他"])
  ]).slice(0, 5);

  const actions = [
    "相談内容を短いメモにまとめ、初回相談で確認する",
    "必要な資料や参考ページを、公開してよい範囲で用意する",
    "次回までに確認することを3つ以内に絞る"
  ];

  const expertItems = needsExpertCheck(data)
    ? [
        "医療、法律、税務、労務、投資、許認可などに関わる内容は、専門家に確認する",
        "契約、費用、責任範囲などの判断が必要な内容は、関係する専門家に相談する"
      ]
    : [];

  return {
    questions,
    checks,
    actions,
    expertItems
  };
}

function renderSheet(data, sheet) {
  summaryTheme.textContent = data.theme;
  summaryType.textContent = data.consultationType;
  summaryBusiness.textContent = data.business;
  summaryProblem.textContent = data.problem;
  summarySupport.textContent = data.support;

  renderList(questionList, sheet.questions);
  renderList(checkList, sheet.checks);
  renderList(actionList, sheet.actions);

  if (sheet.expertItems.length > 0) {
    renderList(expertList, sheet.expertItems);
    expertBlock.hidden = false;
  } else {
    expertList.replaceChildren();
    expertBlock.hidden = true;
  }
}

function renderList(listElement, items) {
  listElement.replaceChildren();

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    listElement.appendChild(listItem);
  });
}

function buildCopyText(data, sheet) {
  const lines = [
    "初回相談ヒアリングシート",
    "",
    "【相談内容の整理】",
    `相談テーマ：${data.theme}`,
    `相談の種類：${data.consultationType}`,
    `事業・活動の概要：${data.business}`,
    `今困っていること：${data.problem}`,
    `希望する支援内容：${data.support}`,
    "",
    "【質問リスト】",
    ...sheet.questions.map((item) => `- ${item}`),
    "",
    "【確認事項】",
    ...sheet.checks.map((item) => `- ${item}`),
    "",
    "【次回アクション】",
    ...sheet.actions.map((item) => `- ${item}`)
  ];

  if (sheet.expertItems.length > 0) {
    lines.push("", "【専門家に確認する項目】", ...sheet.expertItems.map((item) => `- ${item}`));
  }

  lines.push(
    "",
    "※この内容は初回相談前の整理用です。専門的な判断や助言が必要な内容は、専門家に確認してください。"
  );

  return lines.join("\n");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return fallbackCopyText(text);
    }
  }

  return fallbackCopyText(text);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  textarea.remove();
  return copied;
}

function needsExpertCheck(data) {
  const combinedText = `${data.theme} ${data.business} ${data.problem} ${data.support}`;
  return expertKeywords.some((keyword) => combinedText.includes(keyword));
}

function cleanText(value) {
  return String(value || "").trim();
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}
