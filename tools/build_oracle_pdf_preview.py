#!/usr/bin/env python3
"""Build a branded Oracle PDF preview without using an AI provider."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2] / "iching-engine-20260920"
sys.path.insert(0, str(ROOT / "vendor"))

from fpdf import FPDF  # noqa: E402


OUT = Path("/root/.openclaw/workspace/exports/oracle-pdf/oracle-unlimited-preview-v1.pdf")
REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
GOLD = (154, 111, 28)
INK = (44, 33, 24)
PURPLE = (74, 46, 85)
GREEN = (23, 63, 50)


class OraclePDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*GOLD)
        self.cell(0, 6, "Оракул И Цзин • Марина Ахрамович", 0, 1, "R")
        self.set_draw_color(213, 183, 119)
        self.line(17, self.get_y(), 193, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-16)
        self.set_draw_color(213, 183, 119)
        self.line(17, self.get_y(), 193, self.get_y())
        self.ln(2)
        self.set_font("DejaVu", "", 7.6)
        self.set_text_color(*GOLD)
        self.cell(0, 5, f"@astro_marinka  •  astro-marinka.ru  •  стр. {self.page_no()}", 0, 0, "C")


def heading(pdf, text):
    pdf.set_text_color(*PURPLE)
    pdf.set_font("DejaVu", "B", 12)
    pdf.multi_cell(0, 7, text)
    pdf.ln(1)


def paragraph(pdf, text):
    pdf.set_text_color(*INK)
    pdf.set_font("DejaVu", "", 10)
    pdf.multi_cell(0, 6.2, text)
    pdf.ln(3)


def draw_hexagram(pdf, x, y, values, title, moving=True):
    pdf.set_xy(x, y)
    pdf.set_font("DejaVu", "B", 10)
    pdf.set_text_color(*GREEN)
    pdf.multi_cell(72, 5.5, title, 0, "C")
    top = y + 16
    width, gap, line_h = 45, 5, 2.4
    for display_index, value in enumerate(reversed(values)):
        yy = top + display_index * 6.2
        is_yang = value in (7, 9)
        is_change = value in (6, 9)
        pdf.set_fill_color(*GREEN)
        if is_yang:
            pdf.rect(x + 13.5, yy, width, line_h, "F")
        else:
            half = (width - gap) / 2
            pdf.rect(x + 13.5, yy, half, line_h, "F")
            pdf.rect(x + 13.5 + half + gap, yy, half, line_h, "F")
        if moving and is_change:
            pdf.set_fill_color(*GOLD)
            pdf.ellipse(x + 62, yy - 0.4, 3.2, 3.2, "F")


pdf = OraclePDF(format="A4")
pdf.set_margins(17, 16, 17)
pdf.set_auto_page_break(True, 21)
pdf.add_font("DejaVu", "", REGULAR, uni=True)
pdf.add_font("DejaVu", "B", BOLD, uni=True)
pdf.add_page()

pdf.set_text_color(*GOLD)
pdf.set_font("DejaVu", "", 10)
pdf.cell(0, 7, "ПРОСТРАНСТВО ПЯТИ СТИХИЙ", 0, 1, "C")
pdf.set_text_color(*INK)
pdf.set_font("DejaVu", "B", 20)
pdf.multi_cell(0, 10, "Ответ Оракула И Цзин", 0, "C")
pdf.set_font("DejaVu", "", 10)
pdf.set_text_color(92, 74, 68)
pdf.cell(0, 7, "Персональный документ безлимитного тарифа", 0, 1, "C")
pdf.ln(3)
pdf.set_draw_color(213, 183, 119)
pdf.line(17, pdf.get_y(), 193, pdf.get_y())
pdf.ln(8)

pdf.set_fill_color(248, 241, 228)
pdf.rect(17, pdf.get_y(), 176, 43, "F")
box_y = pdf.get_y() + 5
pdf.set_xy(23, box_y)
pdf.set_font("DejaVu", "B", 9)
pdf.set_text_color(*INK)
pdf.cell(28, 6, "Дата запроса:")
pdf.set_font("DejaVu", "", 9)
pdf.cell(0, 6, "20 сентября 2026", 0, 1)
pdf.set_x(23)
pdf.set_font("DejaVu", "B", 9)
pdf.cell(28, 6, "Имя:")
pdf.set_font("DejaVu", "", 9)
pdf.cell(0, 6, "Марина", 0, 1)
pdf.set_x(23)
pdf.set_font("DejaVu", "B", 9)
pdf.cell(28, 6, "Вопрос:")
pdf.set_font("DejaVu", "", 9)
pdf.multi_cell(135, 5.5, "Стоит ли увольняться в октябре и что поможет выйти на доход выше найма?")
pdf.set_y(box_y + 43)

primary = [7, 7, 8, 9, 8, 7]
relating = [7, 7, 8, 8, 8, 7]
draw_hexagram(pdf, 24, pdf.get_y(), primary, "№38 «Разлад»")
draw_hexagram(pdf, 112, pdf.get_y(), relating, "№41 «Убыль»", moving=False)
pdf.set_y(pdf.get_y() + 57)
pdf.set_font("DejaVu", "", 8.5)
pdf.set_text_color(92, 74, 68)
pdf.cell(0, 6, "Подвижная линия: 4-я  •  линии построены снизу вверх", 0, 1, "C")
pdf.ln(4)

heading(pdf, "Короткий ответ")
paragraph(pdf, "Уход из найма может соответствовать направлению развития, но октябрь подходит только для подготовленного перехода. Расклад не поддерживает сценарий «сначала уйду, потом разберусь с деньгами».")
heading(pdf, "Суть ситуации")
paragraph(pdf, "№38 «Разлад» показывает реальное расхождение между нынешней системой работы и вашим собственным путём. Сохранять прежнюю конструкцию любой ценой уже неэффективно, однако большие резкие действия сейчас слабее точных последовательных шагов.")
heading(pdf, "Что показывает подвижная линия")
paragraph(pdf, "Четвёртая линия подчёркивает, что переход не стоит проходить в одиночку. Нужна одна конкретная опора: партнёр, подрядчик, канал продаж, наставник или уже работающая аудитория — не множество советчиков, а тот, кто помогает получить измеримый результат.")

pdf.add_page()
heading(pdf, "Возможный вектор")
paragraph(pdf, "№41 «Убыль» не означает неизбежную потерю денег. Она показывает условие роста: сократить распыление, второстепенные расходы и лишние обещания, чтобы направить ресурс в один сильный денежный контур.")
heading(pdf, "Что лучше сделать сейчас")
for item in [
    "Выбрать один основной продукт, способный постепенно заменить зарплату.",
    "До заявления об уходе проверить спрос реальными оплатами, а не только реакциями и интересом.",
    "Собрать финансовую подушку и заранее сократить необязательные расходы.",
    "Найти одну устойчивую опору в продажах или реализации продукта.",
    "Назначить измеримые условия увольнения: доход, число продаж и срок проверки.",
]:
    pdf.set_text_color(*INK)
    pdf.set_font("DejaVu", "", 10)
    pdf.multi_cell(0, 6.2, "• " + item)
    pdf.ln(1)
pdf.ln(3)
heading(pdf, "Итог")
paragraph(pdf, "Октябрь может стать месяцем выхода, если к дате решения уже создана финансовая и рабочая опора. Если продаж и подушки пока нет, разумнее использовать октябрь как месяц подготовки, а не как прыжок в неизвестность. Оракул показывает возможные сценарии; окончательное решение остаётся за человеком.")

pdf.set_fill_color(245, 241, 232)
pdf.rect(17, pdf.get_y(), 176, 31, "F")
pdf.set_xy(22, pdf.get_y() + 5)
pdf.set_font("DejaVu", "B", 8.5)
pdf.set_text_color(*PURPLE)
pdf.cell(0, 5, "О расчёте", 0, 1)
pdf.set_x(22)
pdf.set_font("DejaVu", "", 7.8)
pdf.set_text_color(92, 74, 68)
pdf.multi_cell(166, 4.7, "Расклад построен единым расчётным ядром И Цзин v1.1.0: метод трёх монет, значения линий 6–7–8–9, порядок снизу вверх, нумерация по последовательности Вэнь-вана. Трактовка сформирована на основе вопроса, основной гексаграммы, подвижной линии и возможного вектора изменения.")

pdf.add_page()
heading(pdf, "Мои наблюдения")
pdf.set_draw_color(213, 183, 119)
for _ in range(14):
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(11)
pdf.ln(4)
pdf.set_font("DejaVu", "B", 11)
pdf.set_text_color(*GREEN)
pdf.cell(0, 7, "Марина Ахрамович", 0, 1, "C")
pdf.set_font("DejaVu", "", 9)
pdf.set_text_color(92, 74, 68)
pdf.multi_cell(0, 6, "Ба-цзы • Ци Мэнь • И Цзин\n@astro_marinka • astro-marinka.ru", 0, "C")

OUT.parent.mkdir(parents=True, exist_ok=True)
pdf.output(str(OUT))
print(OUT)
