import { analyzeMessage } from "../src/lib/analyze";

const samples: { label: string; customerName: string; message: string }[] = [
  {
    label: "Проблема з оплатою",
    customerName: "Олена",
    message:
      "Добрий день! Вчора оплатила замовлення карткою, гроші з рахунку списали двічі, а в особистому кабінеті замовлення досі «очікує оплати». Що мені робити?",
  },
  {
    label: "Запит про доставку",
    customerName: "Василь",
    message:
      "Підкажіть, будь ласка, скільки зазвичай іде доставка Новою поштою до Львова? Хочу замовити подарунок до п’ятниці.",
  },
  {
    label: "Злісна скарга",
    customerName: "Ігор",
    message:
      "Це просто жах!!! Замовив навушники, прийшли з тріснутим корпусом і не заряджаються. Підтримка два дні ігнорує. Якщо сьогодні не повернете гроші — піду в суд і напишу скрізь, який ви шахрайський магазин!",
  },
  {
    label: "Загальне питання",
    customerName: "Марія",
    message:
      "Вітаю! Чи є у вас програма лояльності або знижки для постійних покупців? Дуже подобається ваш асортимент, дякую!",
  },
  {
    label: "Звернення англійською",
    customerName: "John",
    message:
      "Hi, I ordered a jacket two weeks ago and the tracking number hasn't updated in 8 days. Could you check where my parcel is? Thanks.",
  },
];

async function main() {
  console.log(`Model: ${process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001 (default)"}\n`);
  let failures = 0;

  for (const [index, sample] of samples.entries()) {
    console.log(`=== ${index + 1}. ${sample.label} (${sample.customerName}) ===`);
    const started = Date.now();
    try {
      const result = await analyzeMessage(sample.customerName, sample.message);
      console.log(`priority:   ${result.priority}`);
      console.log(`category:   ${result.category}`);
      console.log(`summary:    ${result.summary}`);
      console.log(`draftReply:\n${result.draftReply}`);
    } catch (error) {
      failures++;
      console.error("ПОМИЛКА:", error);
    }
    console.log(`(${((Date.now() - started) / 1000).toFixed(1)} с)\n`);
  }

  if (failures > 0) {
    console.error(`${failures} із ${samples.length} запитів завершилися помилкою`);
    process.exitCode = 1;
  }
}

main();
