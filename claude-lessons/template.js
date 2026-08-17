/* ============================================================
   知识树统一交互脚本
   功能: 拖拽平移、滚轮缩放、节点点击跳转
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('tree-canvas');
  const svg = document.getElementById('tree-links');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  // ---- 应用变换 ----
  function applyTransform() {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  // ---- 鼠标滚轮缩放 ----
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.2), 3);

    // 以鼠标位置为缩放中心
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
    offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
    scale = newScale;

    applyTransform();
    updateZoomIndicator();
  }, { passive: false });

  // ---- 拖拽平移 ----
  canvas.addEventListener('mousedown', function (e) {
    // 如果点击的是节点，不启动拖拽
    if (e.target.closest('.tree-node')) return;
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
    canvas.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    applyTransform();
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  // ---- 触摸支持 ----
  canvas.addEventListener('touchstart', function (e) {
    if (e.target.closest('.tree-node')) return;
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - offsetX;
      dragStartY = e.touches[0].clientY - offsetY;
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', function (e) {
    if (!isDragging || e.touches.length !== 1) return;
    offsetX = e.touches[0].clientX - dragStartX;
    offsetY = e.touches[0].clientY - dragStartY;
    applyTransform();
  }, { passive: true });

  canvas.addEventListener('touchend', function () {
    isDragging = false;
  });

  // ---- 缩放按钮 ----
  document.getElementById('zoom-in')?.addEventListener('click', function () {
    scale = Math.min(scale * 1.2, 3);
    applyTransform();
    updateZoomIndicator();
  });

  document.getElementById('zoom-out')?.addEventListener('click', function () {
    scale = Math.max(scale * 0.8, 0.2);
    applyTransform();
    updateZoomIndicator();
  });

  document.getElementById('zoom-reset')?.addEventListener('click', function () {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
    updateZoomIndicator();
  });

  // ---- 缩放指示器 ----
  function updateZoomIndicator() {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(scale * 100) + '%';
  }

  // ---- 叶节点点击跳转 ----
  document.querySelectorAll('.tree-node.is-leaf').forEach(function (node) {
    node.addEventListener('click', function (e) {
      e.stopPropagation();
      const target = node.getAttribute('data-target');
      if (target) {
        window.location.href = target;
      }
    });
  });

  // ---- 初始化 ----
  applyTransform();
  updateZoomIndicator();

})();
