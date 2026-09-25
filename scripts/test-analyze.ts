import type { Category, Priority } from "../src/db/schema";
import { DEFAULT_MODEL, analyzeMessage, type Analysis } from "../src/lib/analyze";

type Sample = {
  label: string;
  customerName: string;
  message: string;
  expectedCategory: Category;
  /** Перевіряється, лише якщо вказано. */
  expectedPriority?: Priority;
  /** Має знайтися в кожному з полів mentionIn (за замовчуванням — summary і draftReply). */
  mustMention?: RegExp;
  mentionIn?: ("summary" | "draftReply")[];
};

const samples: Sample[] = [
  // --- По одному (або більше) прикладу на кожну категорію ---
  {
    label: "Подвійне списання",
    customerName: "Олена",
    message:
      "Добрий день! Вчора оплатила замовлення карткою, гроші з рахунку списали двічі, а в особистому кабінеті замовлення досі «очікує оплати». Що мені робити?",
    expectedCategory: "payment",
  },
  {
    label: "Обмін розміру",
    customerName: "Наталія",
    message:
      "Куртка не підійшла за розміром. Можна обміняти на M або повернути гроші? Бирки на місці.",
    expectedCategory: "refund",
  },
  {
    label: "Терміни доставки до замовлення",
    customerName: "Василь",
    message:
      "Підкажіть, будь ласка, скільки зазвичай іде доставка Новою поштою до Львова? Хочу замовити подарунок до п’ятниці.",
    expectedCategory: "question",
  },
  {
    label: "Трекінг, англійською",
    customerName: "John",
    message:
      "Hi, I ordered a jacket two weeks ago and the tracking number hasn't updated in 8 days. Could you check where my parcel is? Thanks.",
    expectedCategory: "delivery",
  },
  {
    label: "Скасування замовлення",
    customerName: "Ірина",
    message: "Вчора оформила замовлення, хочу його скасувати, поки не відправили.",
    expectedCategory: "order",
  },
  {
    label: "Не відповідає фото",
    customerName: "Катерина",
    message: "Светр прийшов зовсім іншого кольору, ніж на фото на сайті. Це так і має бути?",
    expectedCategory: "product",
  },
  {
    label: "Сленг: полетів софт",
    customerName: "Вася",
    message: "Кароче пацани полетів софт",
    expectedCategory: "technical",
    // З тексту неясно, чи проблема блокуюча → medium.
    expectedPriority: "medium",
  },
  {
    label: "Сленг: все лагає",
    customerName: "Андрій",
    message: "все лагає нічого не грузиться",
    expectedCategory: "technical",
  },
  {
    label: "Грубий оператор",
    customerName: "Сергій",
    message: "Ваш оператор на гарячій лінії розмовляв зі мною дуже грубо і кинув слухавку.",
    expectedCategory: "complaint",
  },
  {
    label: "Програма лояльності",
    customerName: "Марія",
    message:
      "Вітаю! Чи є у вас програма лояльності або знижки для постійних покупців? Дуже подобається ваш асортимент, дякую!",
    expectedCategory: "question",
  },
  {
    label: "Подяка + ідея",
    customerName: "Тарас",
    message: "Дякую за швидку доставку і гарне пакування! Було б круто, якби додали оплату частинами.",
    expectedCategory: "feedback",
  },
  {
    label: "Вакансія",
    customerName: "Дмитро",
    message: "Шукаю роботу — у вас є вакансії кур’єра?",
    expectedCategory: "other",
  },

  // --- Спірні випадки ---
  {
    label: "Спірне: розбита чашка, поверніть гроші",
    customerName: "Юлія",
    message: "Прийшла розбита чашка, поверніть гроші",
    expectedCategory: "refund",
  },
  {
    label: "Спірне: розбита чашка, що робити",
    customerName: "Світлана",
    message: "Прийшла розбита чашка, що робити?",
    expectedCategory: "product",
  },
  {
    label: "Спірне: оплачене, але не відправлене",
    customerName: "Надія",
    message: "Оплатила, замовлення є в кабінеті, але його досі не відправили.",
    expectedCategory: "order",
  },
  {
    label: "Спірне: кур’єр нагрубив",
    customerName: "Олег",
    message: "Кур’єр нагрубив мені біля під’їзду.",
    expectedCategory: "complaint",
  },
  {
    label: "Спірне: помилка при оплаті",
    customerName: "Максим",
    message: "Не можу оплатити, сайт видає помилку",
    expectedCategory: "technical",
    expectedPriority: "high",
  },
  {
    label: "Спірне: третє звернення без відповіді",
    customerName: "Галина",
    message: "Це вже третє звернення, мені ніхто не відповідає щодо посилки!",
    expectedCategory: "complaint",
  },
  {
    label: "Спірне: оплатила, замовлення нема, верніть гроші",
    customerName: "Оля",
    message: "Оплатила а замовлення нема, верніть гроші",
    expectedCategory: "payment",
  },
  {
    label: "Спірне: брак + ігнорують + вимога грошей",
    customerName: "Ігор",
    message:
      "Це просто жах!!! Замовив навушники, прийшли з тріснутим корпусом і не заряджаються. Підтримка два дні ігнорує. Якщо сьогодні не повернете гроші — піду в суд і напишу скрізь, який ви шахрайський магазин!",
    expectedCategory: "refund",
  },

  // --- Пріоритет технічних проблем ---
  {
    label: "Технічне, блокуюче: нічого не працює",
    customerName: "Богдан",
    message: "Все поломано нічого не працює",
    expectedCategory: "technical",
    expectedPriority: "high",
  },
  {
    label: "Технічне, часткове: трохи лагає",
    customerName: "Леся",
    message: "Сайт трохи лагає, але працює",
    expectedCategory: "technical",
    expectedPriority: "medium",
  },

  // --- Назви сервісів і місць ---
  {
    label: "Сервіс кирилицею: глово",
    customerName: "Софія",
    message: "Коли добавите функцію доставки в глово?",
    expectedCategory: "feedback",
    expectedPriority: "low",
    mustMention: /glovo/i,
  },
  {
    label: "Сервіс кирилицею: епл пей",
    customerName: "Роман",
    message: "Можна оплатити через епл пей?",
    expectedCategory: "question",
    expectedPriority: "low",
    mustMention: /apple\s*pay/i,
  },
  {
    label: "Реальне місто: Жмеринка",
    customerName: "Петро",
    message: "Коли буде доставка у Жмеринку?",
    expectedCategory: "question",
    mustMention: /жмеринк/i,
    mentionIn: ["summary"],
  },
];

type Outcome = { sample: Sample; result?: Analysis; error?: unknown };

function mentionProblems(sample: Sample, result: Analysis): string[] {
  const pattern = sample.mustMention;
  if (!pattern) return [];
  return (sample.mentionIn ?? ["summary", "draftReply"])
    .filter((field) => !pattern.test(result[field]))
    .map((field) => `${field} не містить ${pattern}`);
}

function problemsOf(sample: Sample, result: Analysis): string[] {
  const problems: string[] = [];
  if (result.category !== sample.expectedCategory) {
    problems.push(`категорія: очікувалось ${sample.expectedCategory}, отримано ${result.category}`);
  }
  if (sample.expectedPriority && result.priority !== sample.expectedPriority) {
    problems.push(`пріоритет: очікувалось ${sample.expectedPriority}, отримано ${result.priority}`);
  }
  return [...problems, ...mentionProblems(sample, result)];
}

async function main() {
  console.log(`Model: ${process.env.ANTHROPIC_MODEL || `${DEFAULT_MODEL} (default)`}\n`);
  const outcomes: Outcome[] = [];

  for (const [index, sample] of samples.entries()) {
    console.log(`=== ${index + 1}. ${sample.label} (${sample.customerName}) ===`);
    const started = Date.now();
    try {
      const result = await analyzeMessage(sample.customerName, sample.message);
      const problems = problemsOf(sample, result);
      console.log(`priority:   ${result.priority}`);
      console.log(`category:   ${result.category}`);
      console.log(`summary:    ${result.summary}`);
      console.log(`draftReply:\n${result.draftReply}`);
      console.log(problems.length === 0 ? "✓ усі перевірки пройдено" : problems.map((p) => `✗ ${p}`).join("\n"));
      outcomes.push({ sample, result });
    } catch (error) {
      console.error("ПОМИЛКА:", error);
      outcomes.push({ sample, error });
    }
    console.log(`(${((Date.now() - started) / 1000).toFixed(1)} с)\n`);
  }

  const answered = outcomes.filter((o): o is Outcome & { result: Analysis } => o.result !== undefined);
  const withPriority = answered.filter((o) => o.sample.expectedPriority);
  const withMention = answered.filter((o) => o.sample.mustMention);
  const failed = outcomes.filter((o) => o.error !== undefined);

  console.log("=== Підсумок ===");
  console.log(`Категорія:  ${answered.filter((o) => o.result.category === o.sample.expectedCategory).length} із ${samples.length}`);
  console.log(`Пріоритет:  ${withPriority.filter((o) => o.result.priority === o.sample.expectedPriority).length} із ${withPriority.length}`);
  console.log(`Згадки:     ${withMention.filter((o) => mentionProblems(o.sample, o.result).length === 0).length} із ${withMention.length}`);

  const withProblems = answered
    .map((o) => ({ sample: o.sample, problems: problemsOf(o.sample, o.result) }))
    .filter((o) => o.problems.length > 0);
  if (withProblems.length > 0) {
    console.log("Розбіжності:");
    for (const { sample, problems } of withProblems) {
      console.log(`  - ${sample.label} (${sample.customerName}): ${problems.join("; ")}`);
    }
  }
  if (failed.length > 0) {
    console.log(`Помилки запитів: ${failed.map((o) => o.sample.label).join(", ")}`);
    process.exitCode = 1;
  }
}

main();
