import type { Category } from "../src/db/schema";
import { DEFAULT_MODEL, analyzeMessage } from "../src/lib/analyze";

type Sample = {
  label: string;
  customerName: string;
  message: string;
  expectedCategory: Category;
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
];

type Outcome = { sample: Sample; actual?: Category; error?: unknown };

async function main() {
  console.log(`Model: ${process.env.ANTHROPIC_MODEL || `${DEFAULT_MODEL} (default)`}\n`);
  const outcomes: Outcome[] = [];

  for (const [index, sample] of samples.entries()) {
    console.log(`=== ${index + 1}. ${sample.label} (${sample.customerName}) ===`);
    const started = Date.now();
    try {
      const result = await analyzeMessage(sample.customerName, sample.message);
      const mark = result.category === sample.expectedCategory ? "✓" : `✗ очікувалось ${sample.expectedCategory}`;
      console.log(`priority:   ${result.priority}`);
      console.log(`category:   ${result.category}  ${mark}`);
      console.log(`summary:    ${result.summary}`);
      console.log(`draftReply:\n${result.draftReply}`);
      outcomes.push({ sample, actual: result.category });
    } catch (error) {
      console.error("ПОМИЛКА:", error);
      outcomes.push({ sample, error });
    }
    console.log(`(${((Date.now() - started) / 1000).toFixed(1)} с)\n`);
  }

  const matched = outcomes.filter((o) => o.actual === o.sample.expectedCategory);
  const mismatched = outcomes.filter((o) => o.actual !== undefined && o.actual !== o.sample.expectedCategory);
  const failed = outcomes.filter((o) => o.error !== undefined);

  console.log("=== Підсумок категорій ===");
  console.log(`Збіглося: ${matched.length} із ${samples.length}`);
  if (mismatched.length > 0) {
    console.log("Розбіжності:");
    for (const { sample, actual } of mismatched) {
      console.log(`  - ${sample.label} (${sample.customerName}): очікувалось ${sample.expectedCategory}, отримано ${actual}`);
    }
  }
  if (failed.length > 0) {
    console.log(`Помилки запитів: ${failed.map((o) => o.sample.label).join(", ")}`);
    process.exitCode = 1;
  }
}

main();
