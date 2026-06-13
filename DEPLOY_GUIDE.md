# reCAPTCHA Verify সেটআপ — ডিপ্লয় গাইড

## সমস্যা যা ঠিক করা হয়েছে
আগের কোডে reCAPTCHA token শুধু তৈরি হতো কিন্তু কখনো verify হতো না, এবং token না পেলেও (null) ফর্ম সাবমিট হয়ে যেত। এখন:
- token verify না হলে ফর্ম সাবমিট **বন্ধ** থাকবে।
- verify করা হয় একটি **Cloud Function** দিয়ে, যেখানে আপনার secret key নিরাপদে রাখা হয় (client-side কোডে secret key কখনো রাখা হয়নি)।

## যা যা ফাইল আছে
- `index.html` → আপডেট করা মূল ফাইল
- `functions/index.js` → Cloud Function কোড (secret key এখানে)
- `functions/package.json` → Cloud Function এর dependencies

## ডিপ্লয় করার ধাপ

### ১. Firebase CLI ইনস্টল করুন (যদি না থাকে)
```bash
npm install -g firebase-tools
firebase login
```

### ২. প্রজেক্ট setup
আপনার প্রজেক্টের root ফোল্ডারে যান (যেখানে `functions` ফোল্ডার আছে):
```bash
firebase init functions
```
- existing project সিলেক্ট করুন: `land-tax-8744a`
- ভাষা: JavaScript
- দেওয়া `functions/index.js` এবং `package.json` দিয়ে replace করে দিন (যদি init নতুন ফাইল বানিয়ে দেয়)

### ৩. Deploy করুন
```bash
firebase deploy --only functions
```

Deploy শেষে একটা URL পাবেন, যেমন:
```
https://us-central1-land-tax-8744a.cloudfunctions.net/verifyRecaptcha
```

index.html এ এই URL টা already সেট করা আছে (`VERIFY_ENDPOINT`)। যদি আপনার আসল URL আলাদা হয়, তাহলে index.html এর এই লাইনটা পরিবর্তন করুন:
```js
const VERIFY_ENDPOINT = "https://us-central1-land-tax-8744a.cloudfunctions.net/verifyRecaptcha";
```

## অতিরিক্ত নিরাপত্তা — Firebase Database Rules
আপনার Realtime Database rules ওপেন (`true`) থাকলে যেকেউ সরাসরি API কল করে spam data push করতে পারবে, reCAPTCHA bypass করেও। Firebase Console → Realtime Database → Rules এ গিয়ে নিচের মতো rules সেট করুন (অন্তত write-only, read বন্ধ):

```json
{
  "rules": {
    "customers": {
      ".read": false,
      ".write": true,
      ".validate": "newData.hasChildren(['fullName','whatsapp','bankName','timestamp','service'])"
    }
  }
}
```

এটা পুরো নিরাপত্তা নিশ্চিত করে না (পুরো নিরাপত্তার জন্য Firebase App Check ব্যবহার করা ভালো), কিন্তু একটা গুরুত্বপূর্ণ স্তর যুক্ত করে।

## কম খরচে বিকল্প (যদি Cloud Function না চান)
Firebase Cloud Functions এর Blaze (pay-as-you-go) plan লাগে, কিন্তু এই ছোট ফাংশনের জন্য কার্যত খরচ শূন্যের কাছাকাছি (free tier-এ অনেক কল কভার হয়)।

বিকল্প হিসেবে Vercel/Netlify-এ একই কোড সামান্য পরিবর্তন করে serverless function হিসেবে ফ্রিতেও hosted করা যায় — চাইলে সেই ভার্সনও বানিয়ে দিতে পারি।
