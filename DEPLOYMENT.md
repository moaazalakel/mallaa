# دليل النشر - Deployment Guide

## النشر على GitHub Pages

### الخطوة 1: إعداد GitHub Repository

1. أنشئ مستودع جديد على GitHub (أو استخدم مستودع موجود)
2. تأكد من أن اسم المستودع يطابق `base` في `vite.config.js` (حالياً: `mallaa`)

### الخطوة 2: إعداد المشروع محلياً

1. **تثبيت gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **التحقق من إعدادات Vite**:
تأكد من أن `vite.config.js` يحتوي على:
```javascript
base: '/mallaa/', // يجب أن يطابق اسم المستودع
```

3. **التحقق من إعدادات React Router**:
تأكد من أن `src/main.jsx` يحتوي على:
```javascript
<BrowserRouter basename="/mallaa">
```

### الخطوة 3: رفع الكود إلى GitHub

```bash
# تهيئة Git (إذا لم تكن مهيأ)
git init

# إضافة الملفات
git add .

# عمل commit
git commit -m "Initial commit: منصة الملاءة"

# إضافة remote repository
git remote add origin https://github.com/YOUR_USERNAME/mallaa.git

# رفع الكود
git branch -M main
git push -u origin main
```

### الخطوة 4: النشر

```bash
npm run deploy
```

هذا الأمر سيقوم بـ:
1. بناء المشروع (`npm run build`)
2. رفع مجلد `dist` إلى فرع `gh-pages` على GitHub

### الخطوة 5: تفعيل GitHub Pages

1. اذهب إلى إعدادات المستودع على GitHub
2. انتقل إلى **Settings** → **Pages**
3. في **Source**، اختر **Deploy from a branch**
4. اختر فرع **gh-pages** ومجلد **/ (root)**
5. اضغط **Save**

### الخطوة 6: الوصول للموقع

بعد بضع دقائق، سيكون الموقع متاحاً على:
```
https://YOUR_USERNAME.github.io/mallaa/
```

## تحديث الموقع

عند إجراء أي تغييرات:

```bash
# عمل commit للتغييرات
git add .
git commit -m "Update: وصف التحديث"

# رفع التغييرات
git push

# نشر التحديث
npm run deploy
```

## استكشاف الأخطاء

### المشكلة: الصفحة تظهر فارغة

**الحل**:
1. تأكد من أن `base` في `vite.config.js` يطابق اسم المستودع
2. تأكد من أن `basename` في `src/main.jsx` يطابق اسم المستودع
3. تأكد من أن جميع المسارات النسبية صحيحة

### المشكلة: الصور/الملفات لا تظهر

**الحل**:
1. تأكد من أن جميع الملفات الثابتة في مجلد `public/`
2. استخدم مسارات مطلقة تبدأ بـ `/mallaa/` بدلاً من المسارات النسبية

### المشكلة: التوجيه لا يعمل عند تحديث الصفحة

**الحل**:
GitHub Pages يدعم SPA routing. تأكد من:
1. استخدام `BrowserRouter` (موجود بالفعل)
2. إعداد `basename` بشكل صحيح

## النشر على خوادم أخرى

### Netlify

1. اربط المستودع مع Netlify
2. إعدادات البناء:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (اتركه فارغاً)

### Vercel

1. اربط المستودع مع Vercel
2. إعدادات البناء:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### خادم تقليدي

1. قم ببناء المشروع:
```bash
npm run build
```

2. ارفع محتويات مجلد `dist` إلى خادم الويب
3. تأكد من إعداد الخادم لدعم SPA routing (redirect all routes to index.html)

## ملاحظات أمنية

- هذا نظام تجريبي - لا يحتوي على مصادقة حقيقية
- البيانات محفوظة في localStorage فقط
- لا تستخدم بيانات حقيقية في الإنتاج
