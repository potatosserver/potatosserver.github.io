// js/main.js

async function loadNavbar() {
  try {
    const response = await fetch('components/navbar.html');
    if (response.ok) {
      const html = await response.text();
      document.getElementById('navbar-container').innerHTML = html;
      
      highlightCurrentPage();
    }
  } catch (error) {
    console.error('無法載入導覽列組件:', error);
  }
}

// 自動高亮顯示目前所在的頁面按鈕
function highlightCurrentPage() {
  // 取得當前的路徑檔案名稱，例如 "about.html"
  const path = window.location.pathname;
  let page = path.split("/").pop();
  
  // 如果網址後端為空（即首頁），預設為 index.html
  if (page === "" || page === undefined) {
    page = "index.html";
  }

  // 在導覽列中尋找 href 屬性符合當前檔名的按鈕
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}