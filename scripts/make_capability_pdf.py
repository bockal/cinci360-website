from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUT = "public/Cinci360-Capability-Statement.pdf"
gold = colors.HexColor("#B28D35")
ink = colors.HexColor("#20262B")
muted = colors.HexColor("#606664")
styles = getSampleStyleSheet()
title = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=27, leading=30, textColor=ink, alignment=TA_LEFT, spaceAfter=10)
h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=gold, spaceBefore=9, spaceAfter=5)
body = ParagraphStyle("body", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.4, leading=11.2, textColor=muted)
small = ParagraphStyle("small", parent=body, fontSize=7.5, leading=9.6)

def header_footer(canvas, doc):
    canvas.saveState(); w,h=letter
    canvas.setFillColor(ink); canvas.rect(0,h-34,w,34,fill=1,stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica-Bold",9); canvas.drawString(36,h-22,"CINCI360")
    canvas.setFillColor(gold); canvas.drawRightString(w-36,h-22,"REALITY CAPTURE  /  DIGITAL TWINS  /  CAD + REVIT")
    canvas.setStrokeColor(colors.HexColor("#D6D1C8")); canvas.line(36,31,w-36,31)
    canvas.setFillColor(muted); canvas.setFont("Helvetica",7); canvas.drawString(36,19,"Aubrey Backscheider  |  513-800-7366  |  aubrey@cinci360.com")
    canvas.drawRightString(w-36,19,f"{doc.page}"); canvas.restoreState()

doc=SimpleDocTemplate(OUT,pagesize=letter,rightMargin=36,leftMargin=36,topMargin=54,bottomMargin=42)
story=[Paragraph("Reality captured.<br/><font color='#B28D35'>Possibility modeled.</font>",title),Paragraph("Cinci360 delivers advanced 3D reality capture, digital twins, and architectural documentation for AEC firms, government agencies, insurance carriers, and facility managers nationwide. We transform physical environments into accurate digital assets that reduce field time, accelerate decisions, and improve coordination.",body),Spacer(1,8)]

caps=[("3D REALITY CAPTURE","LiDAR, photogrammetry and hybrid workflows<br/>Interior and exterior as-builts<br/>Construction progress validation<br/>Scan-to-plan and scan-to-BIM<br/>Rapid-response site documentation"),("DIGITAL TWINS","High-accuracy facility replicas<br/>Secure hosting and asset libraries<br/>IoT-ready environments<br/>Multi-property portfolio programs"),("ARCHITECTURAL DOCUMENTATION","As-built CAD and construction documents<br/>Conflict detection and field verification<br/>Renovation and pre-design packages<br/>3D walkthroughs and visualization"),("SUPPORTING TECHNOLOGY","Small-business IT consulting<br/>Web presence and Google Maps strategy<br/>Cloud-based archival systems<br/>Digital workflow integration")]
cells=[]
for heading,text in caps: cells.append([Paragraph(heading,h2),Paragraph(text,small)])
t=Table([[cells[0],cells[1]],[cells[2],cells[3]]],colWidths=[252,252],rowHeights=[110,110],hAlign="LEFT")
t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BOX",(0,0),(-1,-1),.5,colors.HexColor("#D6D1C8")),("INNERGRID",(0,0),(-1,-1),.5,colors.HexColor("#D6D1C8")),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),7)])); story += [t]
story += [Paragraph("SELECTED EXPERIENCE",h2),Paragraph("ChangeUp Architecture - multi-site automotive documentation &nbsp;&nbsp;|&nbsp;&nbsp; BHDP Architecture - corporate projects &nbsp;&nbsp;|&nbsp;&nbsp; Kroger / 84.51 - commercial facilities &nbsp;&nbsp;|&nbsp;&nbsp; 80 Acres Farms - advanced manufacturing &nbsp;&nbsp;|&nbsp;&nbsp; Art Academy of Cincinnati - gallery documentation &nbsp;&nbsp;|&nbsp;&nbsp; DWELL513 - ongoing real-estate capture",body),Paragraph("WHY CINCI360",h2),Paragraph("20+ years of technical systems experience • 8+ years specializing in reality capture and AEC technology • Nationwide provider network • Women-Owned Business (WBE & WOSB) • Deep field experience across architecture, construction, manufacturing, retail, insurance and facilities",body),Spacer(1,8)]
info=Table([[Paragraph("DESIGNATIONS",h2),Paragraph("DUNS 116670255<br/>NAICS 541340, 541511, 541922<br/>PSC T008, T009, C212",small)],[Paragraph("CONTACT",h2),Paragraph("Cinci360, LLC<br/>1116 Fuller St, Cincinnati, OH 45202<br/>Cinci360.com",small)]],colWidths=[125,379]); info.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LINEABOVE",(0,0),(-1,0),1,gold),("LEFTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),6)])); story.append(info)
doc.build(story,onFirstPage=header_footer,onLaterPages=header_footer)
