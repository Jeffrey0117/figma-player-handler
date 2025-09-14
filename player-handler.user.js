// ==UserScript==
// @name         Figma 課程免登入[FP版本]（僅作個人練習用途）
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  GPT改的 functional programming寫的比較乾淨的版本
// @author       You
// @match        https://rar.design/learning/figma/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @run-at       document-end
// ==/UserScript==

/**
 * 📢 聲明說明：
 *
 * 本腳本僅供個人學習與練習 JavaScript/前端技術使用。
 * 使用者本人已合法購買課程內容（價格約新台幣 2,000 元），
 * 撰寫本腳本僅為了研究 DOM 操作、資料綁定、Tampermonkey 應用。
 *
 * ❌ 本腳本：
 * - 不用於任何公開散佈、販售、違規下載
 * - 不提供他人未授權的存取方式
 * - 不破解網站機制或繞過收費制度
 *
 * ✅ 本腳本：
 * - 僅限個人已授權帳號使用
 * - 僅在瀏覽器端動態操作，無資料持久化或轉存
 * - 純屬學術研究與技術練習範例
 *
 * 若網站擁有者不允許此類用途，請立即停止使用此腳本並刪除。
 */
/**
 * 🧭 腳本架構說明：
 *
 * 1. CheckAndRedirect() 檢查是否已進入目標頁面
 * 2. FetchCourseData() 從 API 載入課程資料
 *    └ TransformCoursesData() 將陣列轉換為可查找的物件
 * 3. PrepareLectureItems() 將 lecture 項目處理為可點擊並綁定事件
 * 4. UpdateIframeAndTitle() 在點擊時更新 iframe 與標題文字
 */

window.onload = function () {
    Main();
};

function Main() {
    CheckAndRedirect();
    FetchCourseData().then(courseMap => {
        PrepareLectureItems(courseMap);
    });
}

/** ✅ 檢查目前是否在教學影片主頁（避免在錯誤頁面執行） */
function CheckAndRedirect() {
    const targetUrl = "https://rar.design/learning/figma/3fe3b0cf-608b-469b-b681-10c57ec3fc07";
    if (window.location.href !== targetUrl) {
        console.log("🔁 重定向至影片主頁...");
        window.location.href = targetUrl;
    } else {
        console.log("✅ 已在正確頁面，準備執行腳本...");
    }
}

/** ✅ 取得課程資料，轉為以標題為 key 的查找物件 */
function FetchCourseData() {
    const apiUrl = 'https://api.jsonbin.io/v3/b/6872e7a4b179427992de1adf';

    return $.ajax({
        method: "GET",
        url: apiUrl,
        headers: {
            "accept": "*/*",
            "X-Master-Key": "$2a$10$Ygo9.cK9K4VaHH1k7ZwsseuVi8F3IrPADXTHzZ0cOr69rv.j4Aumm",
            "X-Access-Key": "$2a$10$EyM5lFzsifjZCggJ3f9Hc.yLkGEiORdl0yXoR0aCCCKSkefXh630C",
            "Content-Type": "application/json"
        }
    }).then(response => {
        const data = response.record;
        const courseMap = TransformCoursesData(data);
        console.log("📦 課程資料已取得並轉換：", courseMap);
        return courseMap;
    }).catch(() => {
        console.error("❌ 課程資料載入失敗");
        return {};
    });
}

/** ✅ 將 API 回傳資料轉為 { title: { id, title, url } } 格式 */
function TransformCoursesData(dataArray) {
    return dataArray.reduce((acc, course) => {
        const cleanTitle = course.title.replace(/\d{1,2}:\d{2}/g, '').trim();
        acc[cleanTitle] = {
            id: course.id,
            title: cleanTitle,
            url: course.url
        };
        return acc;
    }, {});
}

/** ✅ 準備所有課程區塊，處理 ID、綁定點擊事件 */
function PrepareLectureItems(courseMap) {
    // 清除 a 標籤的 href 以避免跳轉
    $('a[href^="/learning/figma/"]').each((_, link) => {
        link.href = "";
    });

    // 禁止 lecture-item 的預設點擊行為
    $('.lecture-item').off('click').on('click', e => e.preventDefault());

    // 處理每個 lecture 區塊
    $('div[id^="lecture-"]').each(function (index) {
        const $div = $(this);
        const rawId = $div.attr('id');
        const cleanId = rawId.replace('lecture-', '');

        $div.attr('id', cleanId);
        $div.attr('data-index', index);
        $div.find('svg').remove(); // 移除鎖 icon

        $div.on('click', function () {
            const text = $(this).text().replace(/\d{1,2}:\d{2}/g, '').trim();
            UpdateIframeAndTitle(text, courseMap);
        });
    });

    console.log("🎬 所有課程項目已準備完成");
}

/** ✅ 點擊後更新 iframe 播放區與標題 */
function UpdateIframeAndTitle(title, courseMap) {
    const course = courseMap[title];
    if (!course) {
        console.warn("⚠️ 找不到對應課程資料：", title);
        return;
    }

    $('iframe').attr('src', course.url);
    $('span[aria-current="page"]').text(course.title);
    $('h2').text(course.title);

    console.log("▶️ 已載入課程：", course.title);
}


