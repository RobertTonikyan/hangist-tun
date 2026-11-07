// הכתובת של אפליקציית Rega, מ-.env.local.
// כש-Rega לא באוויר (למשל בפאנל שב-Vercel) המשתנה לא מוגדר, והכפתורים שמובילים אליו פשוט לא מוצגים.
export const REGA_URL = process.env.NEXT_PUBLIC_REGA_URL || null;