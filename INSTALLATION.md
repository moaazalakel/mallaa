# دليل التثبيت - Installation Guide

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

- **Node.js** (الإصدار 18 أو أحدث)
- **npm** (يأتي مع Node.js) أو **yarn** أو **pnpm**

### التحقق من التثبيت

```bash
node --version  # يجب أن يكون 18.x أو أحدث
npm --version   # يجب أن يكون 9.x أو أحدث
```

## التثبيت خطوة بخطوة

### 1. استنساخ المستودع

```bash
git clone https://github.com/YOUR_USERNAME/mallaa.git
cd mallaa
```

أو إذا كان المستودع موجوداً محلياً:

```bash
cd mallaa
```

### 2. تثبيت الحزم

```bash
npm install
```

هذا الأمر سيقوم بتثبيت جميع الحزم المطلوبة:
- React 19
- Vite 7
- Tailwind CSS 4
- React Router
- Recharts
- وغيرها من الحزم

**ملاحظة**: قد يستغرق التثبيت بضع دقائق.

### 3. تشغيل المشروع

```bash
npm run dev
```

ستظهر رسالة مثل:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. فتح المتصفح

افتح المتصفح وانتقل إلى:
```
http://localhost:5173/mallaa/
```

**ملاحظة مهمة**: تأكد من إضافة `/mallaa/` في نهاية الرابط بسبب إعدادات `basename`.

## اختبار التطبيق

### تسجيل الدخول

#### كأخصائي:
- **اسم المستخدم**: `specialist_muscat` (أو أي محافظة أخرى)
- **كلمة المرور**: `123456`

#### كمشرف:
- **اسم المستخدم**: `supervisor`
- **كلمة المرور**: `123456`

### الحسابات المتاحة

الأخصائيين متاحون لكل محافظة:
- `specialist_muscat` - مسقط
- `specialist_dhofar` - ظفار
- `specialist_north_batinah` - شمال الباطنة
- `specialist_south_batinah` - جنوب الباطنة
- `specialist_dakhiliyah` - الداخلية
- `specialist_sharqiyah` - الشرقية
- `specialist_dhahirah` - الظاهرة
- `specialist_buraimi` - البريمي
- `specialist_musandam` - مسندم
- `specialist_wusta` - الوسطى

جميعهم يستخدمون نفس كلمة المرور: `123456`

## الأوامر المتاحة

### التطوير

```bash
npm run dev        # تشغيل خادم التطوير
npm run build      # بناء المشروع للإنتاج
npm run preview    # معاينة البناء
npm run lint       # فحص الكود
```

### النشر

```bash
npm run deploy     # بناء ونشر على GitHub Pages
```

## استكشاف الأخطاء

### المشكلة: `npm install` يفشل

**الحلول**:
1. تأكد من أن Node.js محدث
2. احذف `node_modules` و `package-lock.json` ثم أعد التثبيت:
```bash
rm -rf node_modules package-lock.json
npm install
```

### المشكلة: الصفحة فارغة

**الحلول**:
1. تأكد من فتح الرابط الصحيح: `http://localhost:5173/mallaa/`
2. تحقق من console المتصفح للأخطاء
3. تأكد من أن جميع الحزم مثبتة بشكل صحيح

### المشكلة: البيانات لا تظهر

**الحل**:
البيانات تُولد تلقائياً عند أول تحميل. إذا لم تظهر:
1. افتح Developer Tools (F12)
2. اذهب إلى Application → Local Storage
3. احذف جميع البيانات
4. أعد تحميل الصفحة

### المشكلة: Port 5173 مستخدم

**الحل**:
```bash
# استخدم port آخر
npm run dev -- --port 3000
```

## البنية الأساسية

```
mallaa/
├── public/              # الملفات الثابتة
├── src/
│   ├── assets/         # الصور والفيديوهات
│   ├── components/     # المكونات
│   ├── context/        # React Context
│   ├── data/           # البيانات والثوابت
│   ├── hooks/          # Custom Hooks
│   ├── pages/          # الصفحات
│   ├── App.jsx         # المكون الرئيسي
│   ├── main.jsx        # نقطة الدخول
│   └── index.css       # الأنماط العامة
├── index.html          # HTML الرئيسي
├── package.json        # الحزم والإعدادات
├── vite.config.js      # إعدادات Vite
└── README.md           # الوثائق
```

## الخطوات التالية

بعد التثبيت الناجح:

1. ✅ تأكد من أن التطبيق يعمل محلياً
2. ✅ اختبر تسجيل الدخول بحسابات مختلفة
3. ✅ راجع جميع الصفحات والوظائف
4. ✅ راجع `DEPLOYMENT.md` للنشر على GitHub Pages

## الدعم

إذا واجهت أي مشاكل:
1. راجع قسم "استكشاف الأخطاء" أعلاه
2. تحقق من console المتصفح للأخطاء
3. راجع ملفات README.md و DEPLOYMENT.md
