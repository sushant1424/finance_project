import os
import subprocess
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def to_roman(n):
    val = [10, 9, 5, 4, 1]
    syb = ["x", "ix", "v", "iv", "i"]
    roman_num = ''
    i = 0
    while n > 0:
        for _ in range(n // val[i]):
            roman_num += syb[i]
            n -= val[i]
        i += 1
    return roman_num

class TUReportCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for idx, state in enumerate(self._saved_page_states):
            self.__dict__.update(state)
            page_num = idx + 1
            
            if page_num == 1:
                # Title page: no headers or footers
                super().showPage()
                continue
                
            self.saveState()
            self.setFont("Times-Roman", 9.5)
            self.setFillColor(colors.HexColor("#334155"))
            
            if 2 <= page_num <= 10:
                # Preliminary pages (i, ii, iii...)
                roman_str = to_roman(page_num - 1)
                self.drawCentredString(306, 30, roman_str)
                self.drawString(54, 752, "Tribhuvan University — Faculty of Humanities & Social Sciences")
                self.setStrokeColor(colors.HexColor("#CBD5E1"))
                self.setLineWidth(0.5)
                self.line(54, 745, 558, 745)
                self.line(54, 42, 558, 42)
            else:
                # Main Chapter pages (1, 2, 3...)
                chap_page = page_num - 10
                self.drawRightString(558, 30, str(chap_page))
                self.drawString(54, 30, "FinSight – Smart Personal Finance & Budget Tracker")
                self.drawString(54, 752, "BCA Project Report — Department of Computer Applications")
                self.setStrokeColor(colors.HexColor("#CBD5E1"))
                self.setLineWidth(0.5)
                self.line(54, 745, 558, 745)
                self.line(54, 42, 558, 42)
                
            self.restoreState()
            super().showPage()
        super().save()

def get_report_styles():
    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#1E3A8A")   # Navy/Indigo
    SECONDARY = colors.HexColor("#1E293B") # Dark Slate
    BODY = colors.HexColor("#1E293B")      # Body text
    
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontName='Times-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        alignment=1,
        spaceAfter=15
    )

    cover_body = ParagraphStyle(
        'CoverBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=11.5,
        leading=17,
        textColor=SECONDARY,
        alignment=1,
        spaceAfter=6
    )

    h1_style = ParagraphStyle(
        'ChapterH1',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        alignment=1, # Centered for Chapter headers
        spaceBefore=10,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=11.5,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'SubSectionH3',
        parent=styles['Heading3'],
        fontName='Times-BoldItalic',
        fontSize=10.5,
        leading=13.5,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        leading=13.8,
        textColor=BODY,
        alignment=4, # Justified text for formal reports
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=body_style,
        leftIndent=16,
        firstLineIndent=-10,
        alignment=0,
        spaceAfter=2
    )

    caption_style = ParagraphStyle(
        'FigCaption',
        parent=styles['Normal'],
        fontName='Times-Italic',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569"),
        alignment=1, # Centered caption
        spaceBefore=2,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'THeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=8.5,
        leading=10.5,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TCell',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=8,
        leading=10.5,
        textColor=BODY,
        alignment=0
    )

    return {
        'title': title_style,
        'cover_body': cover_body,
        'h1': h1_style,
        'h2': h2_style,
        'h3': h3_style,
        'body': body_style,
        'bullet': bullet_style,
        'caption': caption_style,
        'theader': table_header_style,
        'tcell': table_cell_style,
        'PRIMARY': PRIMARY
    }

def build_pdf():
    pdf_path = "/home/sush/Desktop/projects/finance_project/FinSight_BCA_Project_Report.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=48,
        bottomMargin=48
    )

    st = get_report_styles()
    story = []

    # ---------------------------------------------------------
    # PAGE 1: COVER PAGE
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Tribhuvan University</b>", st['cover_body']))
    story.append(Paragraph("Faculty of Humanities and Social Science", st['cover_body']))
    story.append(Paragraph("[Your Campus / College Name]", st['cover_body']))
    story.append(Paragraph("Department of Computer Applications", st['cover_body']))
    story.append(Spacer(1, 30))
    story.append(Paragraph("<b>A PROJECT REPORT</b>", st['cover_body']))
    story.append(Paragraph("ON", st['cover_body']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>FinSight – Smart Personal Finance & Budget Tracker</b>", st['title']))
    story.append(Spacer(1, 25))
    story.append(Paragraph("Submitted to", st['cover_body']))
    story.append(Paragraph("Department of Computer Applications", st['cover_body']))
    story.append(Paragraph("[College Name], [Location]", st['cover_body']))
    story.append(Spacer(1, 15))
    story.append(Paragraph("<i>In partial fulfillment of the requirements for the Bachelors in Computer Application</i>", st['cover_body']))
    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>Submitted by:</b>", st['cover_body']))
    story.append(Paragraph("[Student Name 1], Reg no: [XXXX-XXXX-XXXX]", st['cover_body']))
    story.append(Paragraph("[Student Name 2], Reg no: [XXXX-XXXX-XXXX]", st['cover_body']))
    story.append(Paragraph("BCA 6th Semester, III Year", st['cover_body']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Under the supervision of</b>", st['cover_body']))
    story.append(Paragraph("[Supervisor Name]", st['cover_body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 2 (i): SUPERVISOR'S RECOMMENDATION
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Tribhuvan University</b>", st['cover_body']))
    story.append(Paragraph("Faculty of Humanities and Social Science", st['cover_body']))
    story.append(Paragraph("[College Name]", st['cover_body']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>SUPERVISOR’S RECOMMENDATION</b>", st['h1']))
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "I hereby recommend that this project prepared under my supervision by <b>[Student Name 1]</b> and "
        "<b>[Student Name 2]</b> entitled <b>“FinSight – Smart Personal Finance & Budget Tracker”</b> in partial "
        "fulfillment of the requirements for the degree of Bachelor of Computer Application is "
        "recommended for the final evaluation.", st['body']
    ))
    story.append(Spacer(1, 140))
    story.append(Paragraph("Name of the Supervisor:", st['body']))
    story.append(Paragraph("<b>[Supervisor Name]</b>", st['body']))
    story.append(Spacer(1, 30))
    story.append(Paragraph("_______________________________", st['body']))
    story.append(Paragraph("Signature of the Supervisor", st['body']))
    story.append(Spacer(1, 30))
    story.append(Paragraph("BCA 6th Semester, III Year", st['body']))
    story.append(Paragraph("Department of BCA", st['body']))
    story.append(Paragraph("[College Name]", st['body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 3 (ii): LETTER OF APPROVAL
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Tribhuvan University</b>", st['cover_body']))
    story.append(Paragraph("Faculty of Humanities and Social Science", st['cover_body']))
    story.append(Paragraph("[College Name]", st['cover_body']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>LETTER OF APPROVAL</b>", st['h1']))
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "This is to certify that this project prepared by <b>[Student Name 1]</b> and <b>[Student Name 2]</b> entitled "
        "<b>“FinSight”</b> in partial fulfillment of the requirements for the degree of Bachelor in Computer "
        "Application has been evaluated. In our opinion it is satisfactory in the scope and quality as a project "
        "for the required degree.", st['body']
    ))
    story.append(Spacer(1, 30))

    approval_data = [
        [
            Paragraph("<b>SUPERVISOR</b><br/>[Supervisor Name]<br/>Contact no: [Phone]<br/>Department of BCA<br/>[College Name]", st['tcell']),
            Paragraph("<b>HOD / CO-ORDINATOR</b><br/>[HOD Name]<br/>Contact no: [Phone]<br/>Department of BCA<br/>[College Name]", st['tcell'])
        ],
        [
            Paragraph("<b>INTERNAL EXAMINER</b><br/>Name: [Name]<br/>Date: _______________", st['tcell']),
            Paragraph("<b>EXTERNAL EXAMINER</b><br/>Name: [Name]<br/>Date: _______________", st['tcell'])
        ]
    ]
    app_table = Table(approval_data, colWidths=[250, 254])
    app_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#1E293B")),
        ('INNERGRID', (0,0), (-1,-1), 1, colors.HexColor("#1E293B")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(app_table)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 4 (iii): ABSTRACT
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>ABSTRACT</b>", st['h1']))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "FinSight is a modern personal finance and budget tracking platform designed to enable intelligent "
        "expense management, personalized spending insights, and proactive financial control. It features "
        "support for secure registration of users, logging of income and expense transactions with categories "
        "and notes, dynamic account balance calculations, and interactive engagement with financial data through budgets, "
        "savings goals, and real-time alerts. The system also offers features such as analytical breakdown of spending patterns. "
        "With the help of the Z-Score Anomaly Detection algorithm, the app ensures unusual expenses are dynamically flagged by "
        "comparing each transaction against the user’s own historical spending in the same category. A Multinomial Naive Bayes "
        "categorizer integrated with Levenshtein distance typo matching suggests categories in real-time as users type descriptions, "
        "while 1D K-Means spending clustering categorizes expenses into micro, regular, and major purchasing tiers. Additionally, "
        "a Budget Pace Prediction algorithm projects end-of-month totals and warns users before limits are exceeded.", st['body']
    ))
    story.append(Paragraph(
        "FinSight comes with a responsive and minimalist user interface built with modern React components and TailwindCSS, "
        "which is available on desktop and mobile browsers. FastAPI is utilized for solid backend operations and React.js for the "
        "frontend to provide real-time interaction and easy navigation. Administrative and analytical functionality includes "
        "transaction management with soft deletion, budget monitoring with rollover support, savings goal tracking with goal contribution "
        "transfers, recurring transaction detection, CSV import, and an analytics dashboard for tracking metrics such as net worth. "
        "Data privacy is maintained through complete isolation of user data with JWT authentication. The system is designed to scale "
        "with performance optimization for support of concurrent users. Overall, FinSight provides an end-to-end digital space for "
        "personal finance tracking, discovery of spending patterns, and proactive decision support — bridging the gap between simple "
        "spreadsheets and intelligent financial assistants.", st['body']
    ))
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Keywords:</b> Personal Finance, Budget Tracking, Anomaly Detection, Z-Score, Naive Bayes, Levenshtein Distance, "
        "1D K-Means Clustering, Budget Pace Prediction, FastAPI, React.js, PostgreSQL, User Interaction", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 5 (iv): ACKNOWLEDGEMENT
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>ACKNOWLEDGEMENT</b>", st['h1']))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "After a rigorous and continuous quantum of united efforts we are glad to be doing this project report "
        "as our project report on “FinSight”. We express our sincere gratitude to those helping hands "
        "that come forward and directed us towards the success of the whole project with the desired output.", st['body']
    ))
    story.append(Paragraph(
        "We extend our genuine thankfulness to our project supervisor <b>[Supervisor Name]</b> for his/her "
        "valuable and great support and guidance in all the happenings regarding to the project and also we "
        "must express our thanks to <b>[HOD Name]</b>, HOD for his/her encouragement and guidance "
        "throughout the project.", st['body']
    ))
    story.append(Paragraph(
        "We are indebted to the department of computer application for providing support to add on our "
        "venture. Last, but not the least, we would like to thank our teachers and colleagues who have been "
        "knowingly or unknowingly the part of this project and let support and views during the entire "
        "development time.", st['body']
    ))
    story.append(Spacer(1, 30))
    story.append(Paragraph("Your sincerely,", st['body']))
    story.append(Paragraph("<b>[Student Name 1] ([Reg No])</b>", st['body']))
    story.append(Paragraph("<b>[Student Name 2] ([Reg No])</b>", st['body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 6 (v): TABLE OF CONTENTS (Part 1)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>TABLE OF CONTENTS</b>", st['h1']))
    story.append(Spacer(1, 6))

    toc_data_1 = [
        ["SUPERVISOR’S RECOMMENDATION", "i"],
        ["LETTER OF APPROVAL", "ii"],
        ["ABSTRACT", "iii"],
        ["ACKNOWLEDGEMENT", "iv"],
        ["LIST OF FIGURES", "viii"],
        ["LIST OF TABLES", "ix"],
        ["LIST OF ABBREVIATIONS", "x"],
        ["CHAPTER 1: PROJECT INTRODUCTION", "1"],
        ["  1.1 Introduction", "1"],
        ["  1.2 Problem Statements", "1"],
        ["  1.3 Objectives", "2"],
        ["  1.4 Scope and Limitations", "2"],
        ["    1.4.1 Scope", "2"],
        ["    1.4.2 Limitations", "3"],
        ["  1.5 Development Methodology", "3"],
        ["  1.6 Report Organization", "5"],
        ["CHAPTER 2: BACKGROUND STUDY AND LITERATURE REVIEW", "6"],
        ["  2.1 Background Study", "6"],
        ["  2.2 Literature Review", "7"],
        ["  2.3 Study of the Existing System", "8"],
        ["  2.4 Proposed System", "9"]
    ]

    formatted_toc_1 = []
    for item, pg in toc_data_1:
        dots = ". " * 32
        formatted_toc_1.append([Paragraph(f"<b>{item}</b>" if "CHAPTER" in item or item.isupper() else item, st['tcell']),
                                Paragraph(dots, st['tcell']),
                                Paragraph(pg, st['tcell'])])

    toc_table_1 = Table(formatted_toc_1, colWidths=[290, 170, 44])
    toc_table_1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(toc_table_1)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 7 (vi): TABLE OF CONTENTS (Part 2)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>TABLE OF CONTENTS (Continued)</b>", st['h1']))
    story.append(Spacer(1, 6))

    toc_data_2 = [
        ["CHAPTER 3: SYSTEM ANALYSIS AND DESIGN", "10"],
        ["  3.1 System Analysis", "10"],
        ["    3.1.1 Requirement Analysis", "10"],
        ["    3.1.2 Feasibility Analysis", "13"],
        ["    3.1.3 Object Modelling", "16"],
        ["    3.1.4 Dynamic Modelling", "18"],
        ["    3.1.5 Process Modeling", "20"],
        ["  3.2 System Design", "22"],
        ["    3.2.1 Component diagram", "22"],
        ["    3.2.2 Deployment diagram", "23"],
        ["  3.3 Algorithm details", "24"],
        ["    3.3.1 Z-Score Anomaly Detection Algorithm", "24"],
        ["    3.3.2 Naive Bayes Categorizer with Levenshtein Typo Matching", "26"],
        ["    3.3.3 1D K-Means Spending Clustering Algorithm", "28"],
        ["    3.3.4 Budget Pace Prediction Algorithm", "29"],
        ["CHAPTER 4: IMPLEMENTATION AND TESTING", "30"],
        ["  4.1 Implementation", "30"],
        ["    4.1.1 Tools Used (CASE tools, Programming languages, Database platforms)", "30"],
        ["    4.1.2 Implementation Details Of Modules", "32"],
        ["  4.2 Testing", "35"],
        ["    4.2.1 Test cases for Unit Testing", "35"],
        ["    4.2.2 Test cases for System Testing", "38"],
        ["CHAPTER 5: CONCLUSION AND FUTURE RECOMMENDATIONS", "40"],
        ["  5.1 Conclusion", "40"],
        ["  5.2 Lesson learnt/Outcome", "40"],
        ["  5.3 Future Recommendations", "41"],
        ["APPENDICES", "42"],
        ["REFERENCES", "44"]
    ]

    formatted_toc_2 = []
    for item, pg in toc_data_2:
        dots = ". " * 32
        formatted_toc_2.append([Paragraph(f"<b>{item}</b>" if "CHAPTER" in item or item.isupper() else item, st['tcell']),
                                Paragraph(dots, st['tcell']),
                                Paragraph(pg, st['tcell'])])

    toc_table_2 = Table(formatted_toc_2, colWidths=[290, 170, 44])
    toc_table_2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(toc_table_2)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 8 (vii): LIST OF FIGURES
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>LIST OF FIGURES</b>", st['h1']))
    story.append(Spacer(1, 6))

    fig_data = [
        ["Figure 1.1: Incremental Development Methodology of FinSight", "3"],
        ["Figure 3.1: Use Case Diagram of FinSight", "11"],
        ["Figure 3.2: Gantt Chart of FinSight", "15"],
        ["Figure 3.3: Class Diagram of FinSight", "17"],
        ["Figure 3.4: State Diagram for User Authentication", "18"],
        ["Figure 3.5: State Diagram for Anomaly Life Cycle", "19"],
        ["Figure 3.6: Sequence Diagram for User Login and Transaction Creation", "20"],
        ["Figure 3.7: Activity Diagram for CSV Transaction Import", "21"],
        ["Figure 3.8: Component Diagram of FinSight", "22"],
        ["Figure 3.9: Deployment Diagram of FinSight", "23"],
        ["Figure 3.10: Z-Score Anomaly Detection – Algorithm Flowchart", "25"],
        ["Figure 3.11: Naive Bayes & Levenshtein Categorizer – Algorithm Flowchart", "27"],
        ["Figure 3.12: 1D K-Means Spending Clustering – Algorithm Flowchart", "28"],
        ["Figure 4.1: Dashboard – Net Balance and Stats", "33"],
        ["Figure 4.2: Anomaly Detection – Scatter Plot View", "34"]
    ]
    formatted_fig = []
    for item, pg in fig_data:
        formatted_fig.append([Paragraph(item, st['tcell']), Paragraph(". " * 32, st['tcell']), Paragraph(pg, st['tcell'])])
    
    fig_table = Table(formatted_fig, colWidths=[290, 170, 44])
    fig_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'BOTTOM'), ('BOTTOMPADDING', (0,0), (-1,-1), 1)]))
    story.append(fig_table)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 9 (viii): LIST OF TABLES
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>LIST OF TABLES</b>", st['h1']))
    story.append(Spacer(1, 6))

    tab_list_data = [
        ["Table 3.1: Project Schedule for FinSight", "15"],
        ["Table 3.2: Functional Requirements of FinSight", "10"],
        ["Table 3.3: Non-Functional Requirements", "12"],
        ["Table 3.4: Z-Score Severity Thresholds", "25"],
        ["Table 3.5: Budget Pace Status Criteria", "28"],
        ["Table 3.6: Financial Health Score Components", "29"],
        ["Table 4.1: Development Tools and Technologies", "30"],
        ["Table 4.2: API Endpoints Summary", "32"],
        ["Table 4.3: Unit Test Cases", "35"],
        ["Table 4.4: System Test Cases", "38"]
    ]
    formatted_tab = []
    for item, pg in tab_list_data:
        formatted_tab.append([Paragraph(item, st['tcell']), Paragraph(". " * 32, st['tcell']), Paragraph(pg, st['tcell'])])
    
    tab_table = Table(formatted_tab, colWidths=[290, 170, 44])
    tab_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'BOTTOM'), ('BOTTOMPADDING', (0,0), (-1,-1), 2)]))
    story.append(tab_table)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 10 (ix): LIST OF ABBREVIATIONS
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>LIST OF ABBREVIATIONS</b>", st['h1']))
    story.append(Spacer(1, 10))

    abbrev_data = [
        ["API", "Application Programming Interface"],
        ["BCA", "Bachelor of Computer Application"],
        ["CRUD", "Create, Read, Update, Delete"],
        ["CSS", "Cascading Style Sheets"],
        ["CSV", "Comma-Separated Values"],
        ["ER", "Entity-Relationship"],
        ["FK", "Foreign Key"],
        ["HTML", "HyperText Markup Language"],
        ["HTTP", "HyperText Transfer Protocol"],
        ["JWT", "JSON Web Token"],
        ["JSON", "JavaScript Object Notation"],
        ["K-Means", "1D K-Means Spending Clustering Algorithm"],
        ["NB", "Multinomial Naive Bayes Categorizer"],
        ["NPR", "Nepalese Rupee"],
        ["ORM", "Object-Relational Mapping"],
        ["PDF", "Portable Document Format"],
        ["REST", "Representational State Transfer"],
        ["SQL", "Structured Query Language"],
        ["TU", "Tribhuvan University"],
        ["UI", "User Interface"],
        ["UX", "User Experience"],
        ["UML", "Unified Modeling Language"],
        ["UUID", "Universally Unique Identifier"]
    ]

    formatted_abbrev = []
    for code, full in abbrev_data:
        formatted_abbrev.append([Paragraph(f"<b>{code}</b>", st['tcell']), Paragraph(full, st['tcell'])])

    abbrev_table = Table(formatted_abbrev, colWidths=[100, 404])
    abbrev_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9"))
    ]))
    story.append(abbrev_table)
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 11 (Chapter 1: Page 1): CHAPTER 1: PROJECT INTRODUCTION
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>CHAPTER 1: PROJECT INTRODUCTION</b>", st['h1']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>1.1 Introduction</b>", st['h2']))
    story.append(Paragraph(
        "With the age of digital consumption and personal financial complexity, developing significant control over "
        "money and sharing valuable insights requires an updated approach. This project is concerned with designing an "
        "accessible and comprehensive personal finance platform “FinSight” as a valuable asset that will transform the way "
        "digital money is tracked, analysed, and managed.", st['body']
    ))
    story.append(Paragraph(
        "FinSight is a modern personal finance platform that offers the facility of an all-inclusive transaction and "
        "budget management system. Only the registered members are allowed to login to the system and new members can be "
        "registered in the application through secure authentication processes. The system is developed in such a way that it "
        "contains a user module focused on personal financial intelligence. The user module possesses an advanced platform with "
        "individualized spending streams, anomaly alerts, real-time category suggestions using Naive Bayes and Levenshtein typo matching, "
        "1D K-Means spending clustering, and budget pace prediction to facilitate users in understanding their own financial behaviour "
        "easily and rapidly. If a user inputs incorrect information, the system will present appropriate error messages and validation hints. "
        "It thus offers a rapid and safe environment for users.", st['body']
    ))
    story.append(Paragraph(
        "Personal finance management and data-driven decision making are very important aspects of modern digital life, as people "
        "increasingly rely on digital tools for expense tracking, budget discipline, and goal achievement. Statistical analysis of "
        "spending patterns has revolutionized personal finance by blending traditional bookkeeping techniques with contemporary data science "
        "tools, making financial awareness more actionable, captivating, and engaging for individuals. This transformation has created "
        "new opportunities for users to understand themselves through anomaly detection, category auto-suggestion, and predictive alerts "
        "that combine historical data with real-time insight.", st['body']
    ))
    story.append(Paragraph("<b>1.2 Problem Statements</b>", st['h2']))
    story.append(Paragraph("FinSight platform aims to address the following challenges that are present in existing platforms.", st['body']))
    story.append(Paragraph("1. Individuals in Nepal and similar contexts do not have access to a specialized platform where they can track income, expenses, budgets, and savings goals with intelligent statistical analysis beyond simple spreadsheets or basic mobile apps.", st['bullet']))
    story.append(Paragraph("2. Existing finance applications lack modern features like personalized Z-Score anomaly detection, Naive Bayes real-time category prediction with typo tolerance, 1D K-Means spending clustering, and budget pace prediction that help users find quality insights into their own spending behaviour.", st['bullet']))
    story.append(Paragraph("3. Users have no way to track their financial performance, spending anomalies, savings rate, and goal progress through a dedicated personal dashboard system that combines multiple indicators into a single interface.", st['bullet']))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>1.3 Objectives</b>", st['h2']))
    story.append(Paragraph("Some of the key objectives of the project are as follows:", st['body']))
    story.append(Paragraph("1. To create a specialized platform for individuals where they can log income and expense transactions, set monthly budgets, define savings goals, and receive intelligent alerts with complete control over their own financial data.", st['bullet']))
    story.append(Paragraph("2. To implement advanced analytical features including Z-Score anomaly detection, Naive Bayes categorizer with Levenshtein typo matching, 1D K-Means spending clustering, and budget pace prediction that help users discover quality insights into their financial behaviour.", st['bullet']))
    story.append(Paragraph("3. To provide comprehensive personal dashboards where users can track their spending performance, anomaly activity, savings rate history, goal progress, and manage their financial records effectively.", st['bullet']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 12 (Chapter 1: Page 2): SCOPE & METHODOLOGY
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>1.4 Scope and Limitations</b>", st['h2']))
    story.append(Paragraph("<b>1.4.1 Scope</b>", st['h3']))
    story.append(Paragraph("The scope of FinSight platform are as follows:", st['body']))
    story.append(Paragraph("1. Create a comprehensive personal finance platform where users can log, categorise, and analyse income and expense transactions, set budgets, and track savings goals with complete data privacy.", st['bullet']))
    story.append(Paragraph("2. Create responsive web application with modern UI/UX design, dark mode support, and professional interface optimized for financial overview and detailed analysis experience.", st['bullet']))
    story.append(Paragraph("3. Provide comprehensive analytical features including Z-Score anomaly detection, Naive Bayes auto-categorization with typo distance matching, 1D K-Means spending clustering, budget pace prediction, recurring transaction auto-detection, CSV import, and global search across all financial records.", st['bullet']))
    
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>1.4.2 Limitations</b>", st['h3']))
    story.append(Paragraph("The limitations of FinSight platform are as follows:", st['body']))
    story.append(Paragraph("1. Direct bank API integration and automatic transaction fetching is not implemented; users must import CSV files or enter data manually.", st['bullet']))
    story.append(Paragraph("2. Mobile application (iOS/Android) is not developed, restricting access to web browsers only (responsive layout is provided).", st['bullet']))
    story.append(Paragraph("3. Multi-user / family shared accounts and real-time collaborative budgeting features are not available in the current version.", st['bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>1.5 Development Methodology</b>", st['h2']))
    story.append(Paragraph(
        "Incremental Development Methodology was used while building this system. The Incremental Methodology works well for "
        "projects where core functionality can be delivered early and complex analytical modules can be layered on top. There was "
        "specific documentation, evolving requirements for algorithms, and well-understood technology in this project. Thus, Incremental "
        "Methodology was suitable for this system. The final deliverables were clearly understood so Incremental Methodology of Project "
        "Management seemed perfect for the development of this system. The requirements were collected in detailed manner so that each "
        "increment could be tested independently before moving to the next.", st['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Image("/tmp/finsight_diagrams/fig_1_1.png", width=420, height=90))
    story.append(Paragraph("Figure 1.1: Incremental Development Methodology of FinSight", st['caption']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 13 (Chapter 1: Page 3): METHODOLOGY DETAILS
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("The following approach was taken to design, develop, and implement the above mentioned system:", st['body']))
    story.append(Paragraph("<b>Requirement Analysis:</b> The first step is to identify the requirements for the FinSight Finance Platform. This involves conducting a thorough analysis of the user roles, the transaction logging and budget process, anomaly detection requirements, categorization needs, and analytics dashboard requirements. The analysis includes identifying functional requirements like user authentication, transaction CRUD, budget management, goal tracking, and non-functional requirements such as performance, security, and scalability.", st['body']))
    story.append(Paragraph("<b>System Design:</b> Based on the requirements analysis, the system is designed. This includes creating the system architecture. This phase also includes selecting appropriate technologies such as React for the frontend, FastAPI and Python for the backend, PostgreSQL for the database, and implementing statistical algorithms for anomaly detection, clustering, and categorization. The design phase encompasses using object-oriented design including class diagrams and sequence diagrams.", st['body']))
    story.append(Paragraph("<b>Implementation & Coding:</b> In this phase, the system is implemented based on the design specifications. Each module (such as user authentication, transaction creation and editing, anomaly detection engine, Naive Bayes categorizer, K-Means clustering, budget pace prediction, user dashboard, and CSV import) is developed individually and then integrated into the overall system. Unit testing is conducted during this stage to ensure each module works correctly before integration. The implementation follows best practices for code organization, security, and maintainability.", st['body']))
    story.append(Paragraph("<b>Testing:</b> Once the system is developed, it is tested to ensure that it meets the requirements and is free of bugs and errors. The testing process includes unit testing for individual components, integration testing for module interactions, and system testing for overall functionality. The system is also tested for performance optimization, scalability under load, security vulnerabilities, and user experience across different devices and browsers. Test cases are designed to validate both functional requirements and non-functional aspects of the platform.", st['body']))
    story.append(Paragraph("<b>Deployment:</b> After testing, the system is deployed to a production environment. This involves setting up the necessary hardware and software infrastructure, configuring the web server and database systems, implementing security measures, and ensuring proper backup and recovery procedures. The system is then made available to end-users with proper monitoring and maintenance protocols in place to ensure continuous operation and performance optimization.", st['body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 14 (Chapter 1: Page 4): REPORT ORGANIZATION
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>1.6 Report Organization</b>", st['h2']))
    story.append(Paragraph("The chapter wise organization of the report is as following:", st['body']))
    story.append(Paragraph("<b>Chapter 1:</b> Introduction of the project including problem statement related to personal finance visibility challenges, objectives for developing project, and scope and limitations of the project.", st['body']))
    story.append(Paragraph("<b>Chapter 2:</b> Background study and literature review covering fundamental concepts related to the project. Study of existing systems to understand current market solutions and identify gaps.", st['body']))
    story.append(Paragraph("<b>Chapter 3:</b> System analysis and design including requirement analysis for the project. Includes analysis of functional and non-functional requirements. Includes analysis of feasibility like technical, operational, economical. System modeling using various UML diagrams such as Object & Class Diagram, State & Sequence diagram, Activity Diagram and system architecture designs like Component diagram and Deployment diagram to visualize the platform structure and user interactions. It also includes the detail of algorithms used in this project.", st['body']))
    story.append(Paragraph("<b>Chapter 4:</b> Implementation and testing details covering the development process using tools for frontend and backend, database design and integration, user interface development, and testing strategies to ensure platform reliability and user experience quality.", st['body']))
    story.append(Paragraph("<b>Chapter 5:</b> Conclusion and future recommendations summarizing the successful development of project, lessons learned during the development process, challenges faced, and potential future enhancements like mobile application development and advanced bank integration features.", st['body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 15 (Chapter 2: Page 1): BACKGROUND STUDY & LITERATURE REVIEW
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>CHAPTER 2: BACKGROUND STUDY AND LITERATURE REVIEW</b>", st['h1']))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>2.1 Background Study</b>", st['h2']))
    story.append(Paragraph(
        "Digital personal finance tracking and analytical platforms have become essential tools for individuals, students, "
        "and professionals worldwide. These platforms serve as digital spaces where individuals can record their transactions, set "
        "budgets, monitor goals, and engage with their own financial data. According to recent statistics, internet users in Nepal have grown "
        "substantially, creating a potential audience for digital finance platforms. Despite this growth, the country lacks sophisticated "
        "platforms that cater specifically to users who seek statistical insight, anomaly detection, real-time category suggestions, and proactive "
        "alerts rather than simple logging of expenses.", st['body']
    ))
    story.append(Paragraph(
        "The existing digital finance landscape is dominated by international applications like Mint, YNAB, and basic spreadsheet tools, "
        "which primarily focus on either heavy bank integration or zero-based budgeting philosophy. While these platforms serve their purpose "
        "for general money management, they fail to provide an adequate environment for personalized statistical anomaly detection, "
        "Naive Bayes categorisation with typo matching, 1D K-Means spending clustering, and budget pace prediction that are tailored to "
        "individual historical patterns rather than global benchmarks.", st['body']
    ))
    story.append(Paragraph(
        "To address these challenges, a modern, feature-rich personal finance platform specifically designed for the Nepali context is "
        "essential. Such a platform would need to incorporate advanced anomaly detection mechanisms, intelligent category auto-suggestion, "
        "comprehensive analytics dashboards, and goal-tracking features that encourage disciplined financial behaviour and meaningful self-awareness. "
        "It should provide users with the tools and insights they need to understand their spending while offering a curated experience that "
        "helps them stay within budgets and achieve savings goals aligned with their interests and financial pursuits.", st['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>2.2 Literature Review</b>", st['h2']))
    story.append(Paragraph(
        "For this project, we researched and reviewed academic papers, articles, thesis works, and documentation related to personal finance "
        "platforms, anomaly detection systems, and user engagement mechanisms. Throughout our research, we found limited academic work "
        "specifically focused on personalised statistical finance platforms in the context of developing countries like Nepal, highlighting "
        "the need for localized solutions in this domain.", st['body']
    ))
    story.append(Paragraph(
        "Academic studies on financial anomaly detection reveal that users require sophisticated tools for transaction management, "
        "performance analytics, and proactive alerts. Research indicates that platforms supporting both casual and serious budgeters must "
        "provide comprehensive dashboards for tracking spending performance, anomaly frequency, and goal progress. Studies have shown that "
        "individuals are more likely to continue managing their finances when they have access to detailed analytics and can see the impact "
        "of their behaviour on their intended goals. Statistical methods such as Z-Score are efficient tools for flagging unusual transactions, "
        "which has become widespread owing to changing habits of computer users, personalization trends, and emerging access to the internet. "
        "Their comprehensive analysis of various anomaly detection techniques reveals that while recent systems are eminent in giving precise flags, "
        "they suffer from various limitations and challenges like cold-start problems (insufficient history) and sparsity issues. The study emphasizes "
        "that per-user statistical approaches achieve superior results compared to global-threshold methods.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 16 (Chapter 2: Page 2): EXISTING SYSTEM & PROPOSED SYSTEM
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>2.3 Study of the Existing System</b>", st['h2']))
    story.append(Paragraph(
        "In Nepal and globally, the process of personal finance tracking remains largely fragmented and inadequate for users seeking "
        "statistical insight. The existing digital finance landscape consists of a few international platforms that require bank credential "
        "sharing and several local or spreadsheet-based approaches that lack analytical depth. After reviewing major platforms such as Mint (Intuit), "
        "YNAB (You Need A Budget), Walnut, and Goodbudget, we found significant limitations in their current state for the target users of FinSight.", st['body']
    ))
    story.append(Paragraph(
        "Mint, while offering powerful automation through bank APIs and machine-learning categorisation, is geographically limited and requires "
        "users to share banking credentials with a third party. YNAB follows a zero-based budgeting philosophy that is highly effective for "
        "disciplined management but does not include any statistical anomaly detection or spending trend analysis. Mobile-first South Asian apps "
        "such as Walnut and Goodbudget provide envelope-style budgeting and basic expense tracking but do not perform statistical analysis on spending "
        "patterns. Their transaction search and filtering capabilities are also more basic compared to FinSight’s global search and multi-filter transaction table.", st['body']
    ))
    story.append(Paragraph(
        "International platforms, while sophisticated in their approach, present their own challenges for Nepali users. Many favour global "
        "or Western banking ecosystems, often overlooking the need for NPR currency support, CSV-based import from local banks, and fully offline-capable "
        "statistical analysis that does not depend on continuous third-party services.", st['body']
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>2.4 Proposed System</b>", st['h2']))
    story.append(Paragraph(
        "The proposed FinSight platform aims to address the critical gaps and inefficiencies identified in existing personal finance and budget "
        "tracking systems by providing a comprehensive, modern solution specifically designed for individuals who want statistical insight without "
        "sacrificing privacy. This web-based platform will serve as a centralized hub where users can create, log, analyse, and act upon high-quality "
        "financial data while building meaningful self-awareness of their spending behaviour.", st['body']
    ))
    story.append(Paragraph(
        "FinSight will feature an intelligent anomaly detection system that helps users discover unusual expenses that deviate from their own historical "
        "patterns. Unlike existing platforms, the system will implement a sophisticated Z-Score approach that prioritises personal baselines while "
        "ensuring quality alerts reach the user through severity classification (low, medium, high). The platform will provide users with comprehensive "
        "analytics dashboards where they can track their spending performance, monitor anomaly activity, analyse savings rate history, and gain insights "
        "into their financial health. This feature addresses the critical gap in existing local and simple tools that offer no meaningful analytics "
        "or performance tracking capabilities.", st['body']
    ))
    story.append(Paragraph(
        "To foster disciplined financial behaviour, FinSight will implement advanced features including budget pace prediction, Naive Bayes auto-categorization "
        "with Levenshtein typo matching, 1D K-Means spending clustering, recurring transaction auto-detection, CSV import, custom categories, and dynamic balance "
        "calculations. Security and user experience are paramount concerns in the proposed system. FinSight will incorporate robust", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 17 (Chapter 2: Page 3): PROPOSED SYSTEM CONT.
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "authentication measures, secure data handling, and responsive design principles to ensure seamless access across devices. The platform "
        "will feature a clean, distraction-free interface optimized for financial overview and detailed analysis, with modern UI/UX design that "
        "encourages both logging and insight activities. The platform will serve as a catalyst for financial literacy and proactive money management "
        "in Nepal’s digital landscape.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 18 (Chapter 3: Page 1): SYSTEM ANALYSIS & USE CASE
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>CHAPTER 3: SYSTEM ANALYSIS AND DESIGN</b>", st['h1']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>3.1 System Analysis</b>", st['h2']))
    story.append(Paragraph(
        "The system analysis for FinSight focuses on understanding the needs of individuals who want a platform to track and analyse personal "
        "finances with statistical intelligence. During this phase, we identified how users would interact with the system, what features were "
        "necessary to keep them engaged, and how the system could support personalized anomaly detection and category suggestions. The analysis "
        "laid the foundation for designing a platform where users can log, analyse, and act upon financial data while building meaningful self-control.", st['body']
    ))
    story.append(Paragraph("<b>3.1.1 Requirement Analysis</b>", st['h3']))
    story.append(Paragraph(
        "The requirement analysis involved gathering and documenting the essential needs of users. We studied existing platforms and user "
        "expectations to determine the features that would make FinSight useful and engaging. The requirements were divided into functional "
        "requirements and non-functional requirements.", st['body']
    ))
    story.append(Paragraph("<b>i. Functional Requirements:</b>", st['body']))
    story.append(Paragraph("In FinSight, the functional requirements describe the core features that the system must provide to users. These requirements focus on how users will interact with the platform, such as registering, logging transactions, setting budgets, tracking goals, and discovering anomalies. Based on our analysis, the key functional requirements are as follows:", st['body']))
    story.append(Paragraph("1. User Registration: The system enables users to create new accounts with unique names, email addresses, and secure passwords, ensuring authenticated access to the FinSight platform.", st['bullet']))
    story.append(Paragraph("2. User Authentication: Users can log in to their accounts using their credentials and receive a JWT token, providing consistent and secure access to the system.", st['bullet']))
    story.append(Paragraph("3. Transaction Management: The system allows users to create, edit, and delete income and expense transactions with categories, dates, notes, and descriptions, enabling comprehensive financial record management.", st['bullet']))
    story.append(Paragraph("4. Anomaly Detection: Each new expense transaction is automatically analysed via Z-Score against the user’s historical spending in the same category and flagged if statistically unusual.", st['bullet']))
    story.append(Paragraph("5. Budget Management: Users can set monthly spending limits per category; the system calculates current spending and predicts end-of-month totals using pace prediction.", st['bullet']))
    story.append(Paragraph("6. User Dashboard & Insights: Each user has access to a personalized dashboard where they can view net balance, spending trends, anomaly lists, savings rate history, Financial Health Score, and manage their goals and categories.", st['bullet']))
    
    story.append(Spacer(1, 4))
    story.append(Image("/tmp/finsight_diagrams/fig_3_1.png", width=360, height=140))
    story.append(Paragraph("Figure 3.1: Use Case Diagram of FinSight", st['caption']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 19 (Chapter 3: Page 2): NON-FUNCTIONAL & FEASIBILITY
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>ii. Non-Functional Requirements</b>", st['h3']))
    story.append(Paragraph("In FinSight, non-functional requirements describe the qualities that ensure the platform is not only functional but also efficient, secure, and pleasant to use. While functional requirements define what the system does, non-functional requirements define how well it performs those actions. For FinSight, the key non-functional requirements are:", st['body']))
    story.append(Paragraph("1. Security: FinSight implements secure authentication by hashing user passwords with bcrypt before storing them in the database. User sessions are managed using JWT tokens signed with HS256, and only authenticated users can access protected resources. These measures protect personal financial data and prevent unauthorized access.", st['bullet']))
    story.append(Paragraph("2. Usability: The platform is designed with a clean and simple interface built using React and TailwindCSS / shadcn-style components. Navigation is consistent across all pages, and actions such as adding a transaction or reviewing an anomaly provide immediate feedback to the user. This ensures even users with minimal technical knowledge can interact with FinSight easily.", st['bullet']))
    story.append(Paragraph("3. Reliability: To ensure the system is reliable, FinSight is designed with proper error handling in both the backend and frontend. Database operations use transactions to ensure data consistency. User data such as transactions and budgets are stored in PostgreSQL, which ensures data persistence and reduces the risk of data loss.", st['bullet']))
    story.append(Paragraph("4. Scalability: FinSight is built on FastAPI for the backend and React for the frontend, which allows modular growth. PostgreSQL is capable of handling large datasets, and the use of APIs makes it easier to add new features without breaking existing ones. As the number of users increases, the system can be scaled by deploying on cloud platforms and using load balancing in the future.", st['bullet']))
    
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>3.1.2 Feasibility Analysis</b>", st['h3']))
    story.append(Paragraph(
        "A feasibility analysis was carried out to determine whether the platform could realistically be developed within the available resources, "
        "time, and skills. The goal was to ensure that the system would not only be technically possible but also operationally practical, "
        "cost-effective, and achievable within the academic project timeline. The results of the analysis are outlined below:", st['body']
    ))
    story.append(Paragraph("<b>1. Technical Feasibility:</b> Technical feasibility examines whether the platform can be developed using existing technology and resources. The system can be designed and developed using readily available technologies including React.js, FastAPI (Python), and PostgreSQL database. The development team possesses the necessary skills in modern web development, API design, statistical algorithms, and database management.", st['body']))
    story.append(Paragraph("<b>2. Operational Feasibility:</b> Operational feasibility assesses how well the FinSight platform will function within the user community. The system is user-friendly with an intuitive interface, secure authentication mechanisms, clean architecture, and reliable operation for transaction logging and anomaly detection.", st['body']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 20 (Chapter 3: Page 3): SCHEDULE & CLASS DIAGRAM
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>3. Economic Feasibility:</b> Economic feasibility evaluates the cost-effectiveness of the FinSight platform development. The system uses open-source tools including React.js, FastAPI, and PostgreSQL, eliminating software licensing costs. Development costs are minimized through free tools and frameworks. Recurring costs are limited to basic hosting and domain registration, making it economically sustainable.", st['body']))
    story.append(Paragraph("<b>4. Schedule Feasibility:</b> Schedule feasibility assesses whether the project can be completed within the given time frame. The system is developed using well-understood technologies, ensuring on-schedule completion.", st['body']))
    
    story.append(Spacer(1, 4))
    sched_data = [
        ["S.N", "Phases", "Time Duration"],
        ["1", "Requirement Analysis", "1–2 weeks"],
        ["2", "System Design", "3–4 weeks"],
        ["3", "Implementation (Increments 1–4)", "6–8 weeks"],
        ["4", "Testing", "1–2 weeks"],
        ["5", "Documentation & Deployment", "1 week"]
    ]
    sched_table = Table([[Paragraph(f"<b>{c}</b>" if r==0 else c, st['tcell']) for c in row] for r, row in enumerate(sched_data)], colWidths=[40, 260, 160])
    sched_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), st['PRIMARY']),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(sched_table)
    story.append(Paragraph("Table 3.1: Project Schedule for FinSight", st['caption']))
    
    story.append(Spacer(1, 2))
    story.append(Image("/tmp/finsight_diagrams/fig_3_2.png", width=400, height=85))
    story.append(Paragraph("Figure 3.2: Gantt Chart of FinSight", st['caption']))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3.1.3 Object Modelling</b>", st['h3']))
    story.append(Paragraph(
        "Object modeling in FinSight is used to represent the main entities of the platform and how they interact with each other. "
        "Since the system is based on users logging transactions, setting budgets, and tracking goals, we identified the core objects "
        "required to support these activities. Each object represents a real-world entity within the platform, such as users, transactions, "
        "budgets, goals, and categories. These objects are later implemented as models in SQLAlchemy, forming the backbone of the application’s database structure.", st['body']
    ))
    story.append(Paragraph(
        "The main object in FinSight platform is the User object, representing each platform user. The User class includes important attributes "
        "such as id (UUID), name, email, password_hash, currency, and preferences. This model captures the unique data associated with each user, "
        "which is essential for authentication, profile management, and personalized experiences on the platform.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 21 (Chapter 3: Page 4): DYNAMIC & PROCESS MODELING
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Central to the finance functionality is the Transaction class, which manages income and expense records. Its attributes include "
        "id, type, amount, description, category, date, is_anomaly, z_score, and anomaly_severity. This structure supports rich transaction "
        "management, allowing users to create, update, and track the analytical status of their records.", st['body']
    ))
    story.append(Paragraph(
        "Additional core objects include Budget (category, monthly_limit, spent, pace), Goal (name, target_amount, current_amount, target_date, progress), "
        "GoalContribution, UserCategory, and NetWorthSnapshot. Service objects such as AnomalyService, AnalyticsService, CategorizerService, and "
        "BudgetService encapsulate the statistical algorithms.", st['body']
    ))
    story.append(Spacer(1, 2))
    story.append(Image("/tmp/finsight_diagrams/fig_3_3.png", width=400, height=120))
    story.append(Paragraph("Figure 3.3: Class Diagram of FinSight", st['caption']))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3.1.4 Dynamic Modelling</b>", st['h3']))
    story.append(Paragraph(
        "Dynamic modeling in FinSight is used to represent how the system behaves during user interactions, showing how objects communicate "
        "and how their states change over time. State diagrams illustrate conditions such as user authentication flow and anomaly lifecycle.", st['body']
    ))
    story.append(Image("/tmp/finsight_diagrams/fig_3_4_5.png", width=420, height=65))
    story.append(Paragraph("Figure 3.4 & 3.5: State Diagrams for User Authentication & Anomaly Life Cycle", st['caption']))
    
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>3.1.5 Process Modeling</b>", st['h3']))
    story.append(Image("/tmp/finsight_diagrams/fig_3_6.png", width=400, height=95))
    story.append(Paragraph("Figure 3.6: Sequence Diagram for User Login and Transaction Creation", st['caption']))

    story.append(Spacer(1, 2))
    story.append(Image("/tmp/finsight_diagrams/fig_3_7.png", width=400, height=70))
    story.append(Paragraph("Figure 3.7: Activity Diagram for CSV Transaction Import", st['caption']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 22 (Chapter 3: Page 5): SYSTEM DESIGN & Z-SCORE ALGORITHM
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>3.2 System Design</b>", st['h2']))
    story.append(Paragraph(
        "System design defines the architecture, components, modules, interfaces, and data flow necessary to implement the FinSight "
        "platform according to its requirements. It translates the outcomes of system analysis into a detailed blueprint that guides the "
        "development process. This includes breaking the system into manageable modules, defining their interactions, and planning the structure "
        "of the database and front-end interfaces.", st['body']
    ))
    story.append(Paragraph("<b>3.2.1 Component diagram:</b> The component diagram for FinSight illustrates the organization of major modules such as User Management, Transaction Management, Authentication Service, Analytics / Anomaly Service, Budget & Goal Service, Database Layer and User Interface.", st['body']))
    story.append(Paragraph("<b>3.2.2 Deployment diagram:</b> The deployment diagram shows how FinSight’s software components are distributed across physical servers and devices. The frontend React application runs on a web server, communicates with the FastAPI backend via HTTP REST, which in turn connects to PostgreSQL.", st['body']))
    story.append(Spacer(1, 2))
    story.append(Image("/tmp/finsight_diagrams/fig_3_8_9.png", width=420, height=95))
    story.append(Paragraph("Figure 3.8 & 3.9: Component Diagram and Deployment Diagram of FinSight", st['caption']))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3.3 Algorithm details</b>", st['h2']))
    story.append(Paragraph("<b>3.3.1 Z-Score Anomaly Detection Algorithm</b>", st['h3']))
    story.append(Paragraph(
        "The Z-Score Anomaly Detection Algorithm implemented in FinSight serves as the core mechanism for the platform’s unusual expense "
        "flagging system, addressing the critical challenge of identifying transactions that deviate significantly from a user’s own historical "
        "spending pattern within a given category. In personal finance platforms like FinSight, users expect to be alerted only when something "
        "is genuinely unusual for them – not against a global average. This algorithm was specifically designed to solve FinSight’s personalisation "
        "problem by implementing a statistical scoring system that measures how many standard deviations a new transaction is from the user’s mean "
        "in the same category.", st['body']
    ))
    story.append(Paragraph("<b>Mathematical Foundation:</b> The algorithm follows the formula:", st['body']))
    story.append(Paragraph("z = (x − µ) / σ", st['body']))
    story.append(Paragraph(
        "Where x is the new transaction amount, µ is the mean of historical amounts in the same category for the same user, and σ is the "
        "standard deviation of those amounts. To prevent near-zero standard deviation instability when past expenses are identical, an "
        "Epsilon Floor is applied: σ_floored = max(σ, |µ| * 0.05). Thresholds of |z| >= 2.0 (moderate) and |z| >= 3.0 (high) are used for severity. "
        "A minimum sample size threshold (MIN_SAMPLES = 5) prevents false alarms on new categories.", st['body']
    ))
    story.append(Image("/tmp/finsight_diagrams/fig_3_10.png", width=420, height=65))
    story.append(Paragraph("Figure 3.10: Z-Score Anomaly Detection – Algorithm Flowchart", st['caption']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 23 (Chapter 3: Page 6): NAIVE BAYES, K-MEANS & PACE ALGORITHMS
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>3.3.2 Naive Bayes Categorizer with Levenshtein Typo Matching</b>", st['h3']))
    story.append(Paragraph(
        "The Naive Bayes Categorizer with Levenshtein Typo Matching serves as FinSight’s real-time transaction category auto-suggestion "
        "engine. Manually selecting categories for every transaction increases user effort and friction. To solve this, FinSight implements "
        "a hybrid NLP algorithm combining brand phrase lookup, Levenshtein edit distance typo tolerance, and Multinomial Naive Bayes text classification.", st['body']
    ))
    story.append(Paragraph(
        "<b>Mathematical & Logical Foundation:</b> The algorithm operates in 3 sequential steps:<br/>"
        "1. <i>Brand Phrase Lookup:</i> Checks description against known brand dictionary (PHRASE_HINTS) mapping 'pathao' -> transport, 'bhatbhateni' -> food.<br/>"
        "2. <i>Levenshtein Edit Distance:</i> For unknown words, calculates min single-character edit operations (insertions, deletions, substitutions): "
        "d(a, b) = min(del, ins, sub). Matches typos like 'pathaoo' -> 'pathao' (distance 1).<br/>"
        "3. <i>Multinomial Naive Bayes:</i> Computes posterior probability of category C given word tokens W: "
        "P(C | W) ∝ P(C) * ∏ P(w_i | C). Uses Laplace smoothing: P(w_i | C) = (count(w_i, C) + 1) / (total_words(C) + |V| + 1). "
        "Calculated in log-space: log P(C) + ∑ log P(w_i | C) to prevent floating-point underflow. Rejects guesses with confidence < 28%.", st['body']
    ))
    story.append(Image("/tmp/finsight_diagrams/fig_3_11.png", width=420, height=65))
    story.append(Paragraph("Figure 3.11: Naive Bayes Categorizer – Algorithm Flowchart", st['caption']))

    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>3.3.3 1D K-Means Spending Clustering Algorithm</b>", st['h3']))
    story.append(Paragraph(
        "The 1D K-Means Spending Clustering Algorithm automatically segments a user's expense history into 3 natural spending tiers "
        "(micro: small daily buys, regular: standard expenses, major: large purchases) without requiring hardcoded static money amounts.", st['body']
    ))
    story.append(Paragraph(
        "<b>Mathematical Foundation:</b> Given 1D expense amounts X, initializes centroids µ_0, µ_1, µ_2 at the minimum, median, and maximum amounts. "
        "Iteratively assigns each point x_i to nearest centroid k: Cluster(x_i) = argmin_k |x_i - µ_k|, then updates centroids: µ_k = (1/|S_k|) * ∑ x. "
        "Iterates until assignments stabilize or reaching max 100 iterations. Fallback handling sets min/max centroids for users with < 3 transactions.", st['body']
    ))
    story.append(Image("/tmp/finsight_diagrams/fig_3_12.png", width=420, height=65))
    story.append(Paragraph("Figure 3.12: 1D K-Means Spending Clustering – Algorithm Flowchart", st['caption']))

    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>3.3.4 Budget Pace Prediction Algorithm</b>", st['h3']))
    story.append(Paragraph(
        "Traditional budget tracking only tells users what they have spent so far. FinSight calculates daily burn rate: Daily Rate = Spent / Current Day, "
        "and projects total month spend: Projected = Daily Rate * Days in Month. Evaluates status: on_track, at_risk (>80%), will_exceed (>100%), exceeded.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 24 (Chapter 4: Page 1): IMPLEMENTATION & TOOLS
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>CHAPTER 4: IMPLEMENTATION AND TESTING</b>", st['h1']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>4.1 Implementation</b>", st['h2']))
    story.append(Paragraph("During the implementation phase of FinSight, the design specifications were translated into a working full-stack web application. Each module was developed, unit-tested, and then integrated. The implementation followed best practices for code organisation, security, and maintainability.", st['body']))
    story.append(Paragraph("<b>4.1.1 Tools Used (CASE tools, Programming languages, Database platforms)</b>", st['h3']))

    tools_data = [
        ["Category", "Technology", "Purpose"],
        ["Frontend", "React 18 + Vite + Redux Toolkit + TailwindCSS", "SPA, state management, styling"],
        ["Backend", "FastAPI (Python 3.11+)", "REST API, business logic, algorithms"],
        ["ORM", "SQLAlchemy 2.0", "Database abstraction layer"],
        ["Database", "PostgreSQL 15", "Persistent relational storage"],
        ["Auth", "JWT + bcrypt", "Secure token-based authentication"],
        ["Charts", "Recharts", "Interactive spending visualization"],
        ["Algorithms", "Pure Python (statistics, math modules)", "Z-Score, Naive Bayes, K-Means, Pace Prediction"]
    ]
    tools_table = Table([[Paragraph(f"<b>{c}</b>" if r==0 else c, st['tcell']) for c in row] for r, row in enumerate(tools_data)], colWidths=[90, 220, 194])
    tools_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), st['PRIMARY']),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(tools_table)
    story.append(Paragraph("Table 4.1: Development Tools and Technologies", st['caption']))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>4.1.2 Implementation Details Of Modules</b>", st['h3']))
    story.append(Paragraph(
        "The major modules implemented are: Authentication (register / login with JWT), Transaction CRUD with automatic Z-Score analysis on every expense, "
        "Budget management with real-time pace calculation and rollover support, Savings Goals with contribution transaction history, Analytics Dashboard "
        "(net worth, category breakdown, spending clusters, 30-day forecast), Recurring Transaction auto-detection, CSV Import pipeline, Global Search, and Custom Category management. "
        "All algorithms were implemented from scratch in pure Python without external machine-learning libraries, demonstrating direct application of statistical concepts.", st['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>4.2 Testing</b>", st['h2']))
    story.append(Paragraph("Once the system was developed, it was tested to ensure that it meets requirements and is free of bugs and errors. Testing included unit testing and system testing.", st['body']))
    story.append(Paragraph("<b>4.2.1 Test cases for Unit Testing</b>", st['h3']))
    
    unit_test_data = [
        ["Test Case ID", "Module Tested", "Expected Result", "Status"],
        ["UT-01", "Password Hashing (bcrypt)", "Password correctly hashed & verified", "PASS"],
        ["UT-02", "Z-Score (N < 5)", "Returns status: 'not_enough_data'", "PASS"],
        ["UT-03", "Z-Score (Epsilon Floor)", "Prevents division by zero on identical amounts", "PASS"],
        ["UT-04", "Naive Bayes Categorizer", "Returns category with confidence score", "PASS"],
        ["UT-05", "Levenshtein Distance", "Matches 'pathaoo' to 'pathao' (distance 1)", "PASS"],
        ["UT-06", "1D K-Means Clustering", "Clusters amounts into 3 distinct centroids", "PASS"],
        ["UT-07", "Budget Pace Prediction", "Correctly projects end-of-month spend", "PASS"]
    ]
    unit_table = Table([[Paragraph(f"<b>{c}</b>" if r==0 else c, st['tcell']) for c in row] for r, row in enumerate(unit_test_data)], colWidths=[70, 160, 214, 60])
    unit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), st['PRIMARY']),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(unit_table)
    story.append(Paragraph("Table 4.3: Unit Test Cases", st['caption']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 25 (Chapter 4 System Testing & Chapter 5 Conclusion)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>4.2.2 Test cases for System Testing</b>", st['h3']))
    story.append(Paragraph(
        "System testing validated end-to-end flows: user registration → login → create expense → automatic anomaly flag → view anomaly page → set budget → observe pace warning → create goal → add contribution → import CSV → verify imported transactions. Cross-browser and responsive layout checks were also performed. All critical paths passed successfully.", st['body']
    ))
    
    sys_test_data = [
        ["Test Case ID", "System Workflow Tested", "Expected Result", "Status"],
        ["ST-01", "User Auth & JWT Flow", "User registers, logs in, receives valid JWT", "PASS"],
        ["ST-02", "Transaction & Anomaly Flagging", "Expense created, scored via Z-Score, saved to DB", "PASS"],
        ["ST-03", "Real-Time Auto Categorization", "Typing description suggests correct category", "PASS"],
        ["ST-04", "Budget Pace Warning", "High spending triggers pace warning status", "PASS"],
        ["ST-05", "Goal Deposit Transfer", "Contribution creates transfer transaction to Goal account", "PASS"],
        ["ST-06", "CSV Import Pipeline", "Batch file parsed, validated, and saved", "PASS"]
    ]
    sys_table = Table([[Paragraph(f"<b>{c}</b>" if r==0 else c, st['tcell']) for c in row] for r, row in enumerate(sys_test_data)], colWidths=[70, 160, 214, 60])
    sys_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), st['PRIMARY']),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(sys_table)
    story.append(Paragraph("Table 4.4: System Test Cases", st['caption']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>CHAPTER 5: CONCLUSION AND FUTURE RECOMMENDATIONS</b>", st['h1']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>5.1 Conclusion</b>", st['h2']))
    story.append(Paragraph(
        "To conclude, the project FinSight is a successful implementation of a modern, statistically intelligent personal "
        "finance and budget tracking platform. All stated objectives – unified transaction and budget management, Z-Score based anomaly "
        "detection, Multinomial Naive Bayes categorizer with Levenshtein typo matching, 1D K-Means spending clustering, budget pace prediction, "
        "savings goal tracking, recurring detection, CSV import, and global search – have been achieved. The system provides an end-to-end digital "
        "space for financial data creation, discovery of spending patterns, and proactive self-management, bridging the gap between simple "
        "spreadsheets and sophisticated financial assistants. The use of FastAPI, React, PostgreSQL, and pure Python statistical algorithms "
        "demonstrates a solid application of concepts learned during the BCA programme.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 26 (Chapter 5 Outcome & Future Work)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>5.2 Lesson learnt/Outcome</b>", st['h2']))
    story.append(Paragraph(
        "During the development of FinSight we learned the practical importance of incremental delivery: core CRUD and authentication "
        "could be validated early, after which complex analytical modules were layered on top with confidence. We gained deeper understanding "
        "of statistical and machine learning methods (Z-Score, Naive Bayes, K-Means) applied to real user data, the necessity of careful edge-case "
        "handling (insufficient history, zero variance, epsilon floor), and the value of clean separation between service modules (AnomalyService, "
        "CategorizerService, ClusteringService, BudgetService). Working with JWT authentication, SQLAlchemy, and a modern React + Redux stack "
        "also strengthened our full-stack engineering skills. Challenges faced included designing a personalised anomaly threshold that remains "
        "meaningful with sparse data and ensuring that forecast and pace algorithms remain interpretable to non-technical users.", st['body']
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>5.3 Future Recommendations</b>", st['h2']))
    story.append(Paragraph("The following enhancements are recommended for future work:", st['body']))
    story.append(Paragraph("1. Native mobile applications (iOS / Android) with offline-first support and push notifications for anomaly and budget alerts.", st['bullet']))
    story.append(Paragraph("2. Direct bank API / Open Banking integration (where available) so that transactions can be fetched automatically instead of manual CSV import.", st['bullet']))
    story.append(Paragraph("3. Shared / family accounts with role-based access and collaborative budgeting.", st['bullet']))
    story.append(Paragraph("4. More advanced machine-learning models for multi-variate anomaly detection once sufficient per-user history is available.", st['bullet']))
    story.append(Paragraph("5. Export of richer reports (PDF / Excel) with customisable date ranges and narrative financial insights.", st['bullet']))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 27 (Appendices)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>APPENDICES</b>", st['h1']))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Appendix A – Sample API Endpoints (abbreviated)</b>", st['h2']))
    story.append(Paragraph(
        "POST /api/auth/register, POST /api/auth/login, GET /api/transactions, POST /api/transactions, GET /api/budgets, "
        "POST /api/budgets, GET /api/goals, POST /api/goals/{id}/contribute, GET /api/analytics/dashboard, GET /api/analytics/clusters, "
        "GET /api/anomalies, POST /api/transactions/import, GET /api/categories/suggest, GET /api/search, etc.", st['body']
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Appendix B – Sample Database Schema Notes</b>", st['h2']))
    story.append(Paragraph(
        "All primary keys are UUIDs. Foreign keys enforce referential integrity. Unique constraint on (user_id, category, month, year) "
        "for budgets. Anomaly results (z_score, severity, status) are stored directly on the transaction row for atomicity and query performance.", st['body']
    ))
    story.append(PageBreak())

    # ---------------------------------------------------------
    # PAGE 28 (References)
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>REFERENCES</b>", st['h1']))
    story.append(Spacer(1, 8))
    refs = [
        "[1] Chandola, V., Banerjee, A., & Kumar, V. (2009). Anomaly Detection: A Survey. ACM Computing Surveys.",
        "[2] MacQueen, J. (1967). Some methods for classification and analysis of multivariate observations. Proceedings of 5th Berkeley Symposium on Mathematical Statistics and Probability.",
        "[3] McCallum, A., & Nigam, K. (1998). A comparison of event models for Naive Bayes text classification. AAAI Workshop on Learning for Text Categorization.",
        "[4] Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. Soviet Physics Doklady.",
        "[5] FastAPI Documentation. https://fastapi.tiangolo.com/",
        "[6] React Documentation. https://react.dev/",
        "[7] PostgreSQL Documentation. https://www.postgresql.org/docs/",
        "[8] SQLAlchemy Documentation. https://docs.sqlalchemy.org/",
        "[9] Related academic and industry resources on personal finance applications and statistical process control."
    ]
    for r in refs:
        story.append(Paragraph(r, st['body']))
        story.append(Spacer(1, 2))

    doc.build(story, canvasmaker=TUReportCanvas)
    print(f"Report built successfully at {pdf_path}!")

if __name__ == '__main__':
    build_pdf()
