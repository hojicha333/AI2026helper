(async function() {
    console.log("🚀 终极挂课脚本 V5（修复播放节奏+防切屏版）已启动！");

    // ================= 1. 拦截切屏事件 =================
    try {
        const blockEvents = ['visibilitychange', 'webkitvisibilitychange', 'blur', 'pagehide'];
        blockEvents.forEach(eventName => {
            window.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
            document.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
        });
    } catch (e) { }

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    const videoItems = document.querySelectorAll('.name, .child-item');
    if (videoItems.length === 0) return console.error("❌ 未找到课程列表！");

    console.log(`✅ 共扫描到 ${videoItems.length} 个目标...`);

    for (let i = 0; i < videoItems.length; i++) {
        const currentItem = videoItems[i];
        const parentText = currentItem.parentElement ? currentItem.parentElement.innerText : currentItem.innerText;
        
        if (parentText.includes('100%') || parentText.includes('已完成')) {
            console.log(`⏭️ 第 ${i + 1} 个已完成，跳过！`);
            continue;
        }

        console.log(`▶️ 打开第 ${i + 1} 个视频...`);
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(1500); 

        const realClick = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        currentItem.dispatchEvent(realClick);
        
        console.log("⏳ 等待 6 秒钟让弹窗和播放器完全渲染...");
        await sleep(6000); 

        // 【关键修复】第一次点播，带有节奏的强攻
        await forcePlayVideo();

        console.log("⏳ 正在监测视频状态...");
        await waitForVideoToEnd(i + 1);

        console.log(`☑️ 第 ${i + 1} 个结束，关闭弹窗...`);
        forceCloseModal();
        await sleep(3500); 
    }

    console.log("🎉 当前页面的所有任务已跑完！");

    // ================= 核心功能库 =================

    // 【关键修复】带有节奏的点击逻辑，点亮即停
    async function forcePlayVideo() {
        const video = document.querySelector('video');
        if (video) {
            video.muted = true; // 强制静音解锁自动播放
            await sleep(500);
        }
        
        // 依次尝试我们发现的那些套娃元素
        const targets = [
            document.querySelector('.video-play-img img'), // 最里面的图片
            document.querySelector('.video-play-img'),     // 中间层
            document.querySelector('.video-play'),         // 外层
            document.querySelector('.vjs-big-play-button') // 原生大按钮
        ];

        for (let target of targets) {
            if (target && target.offsetParent !== null) {
                console.log(`👉 尝试物理点击...`);
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                
                // 给框架 800 毫秒的时间去处理点击事件并启动视频
                await sleep(800); 
                
                // 如果视频已经动起来了，就不再点后面的元素了，防止误点暂停
                if (video && !video.paused) {
                    console.log("✅ 播放成功激活！");
                    return; 
                }
            }
        }

        // 终极兜底
        if (video && video.paused) {
            console.log("👉 物理点击无效，强制呼叫底层 API...");
            video.play().catch(() => console.log("底层 API 被拦截"));
        }
    }

    function forceCloseModal() {
        const realClick = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        const spanIcon = document.querySelector('.anticon-close');
        const divContainer = document.querySelector('.video-modal-close');
        const modalMask = document.querySelector('.video-modal-mask');
        
        if (spanIcon && spanIcon.offsetParent !== null) { spanIcon.dispatchEvent(realClick); return; }
        if (divContainer && divContainer.offsetParent !== null) { divContainer.dispatchEvent(realClick); return; }
        if (modalMask) { modalMask.dispatchEvent(realClick); return; }
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'bubbles': true}));
    }

    function waitForVideoToEnd(index) {
        return new Promise((resolve) => {
            let maxTimeout = 0; 
            const videoEl = document.querySelector('video');

            if (videoEl) {
                videoEl.muted = true; 
                videoEl.addEventListener('pause', async function() {
                    if (videoEl.currentTime < videoEl.duration - 1) {
                        console.log("⚡ 平台尝试暂停！重新激活播放...");
                        // 重新召唤带有节奏的点击
                        await forcePlayVideo(); 
                    }
                });
            }

            const checkInterval = setInterval(async () => {
                maxTimeout++;
                const currentVideo = document.querySelector('video');
                
                if (currentVideo) {
                    currentVideo.muted = true;
                    if (currentVideo.paused && currentVideo.currentTime < currentVideo.duration) {
                        console.log("⚡ 轮询发现暂停，再次点击！");
                        await forcePlayVideo();
                    }

                    if (currentVideo.ended || (currentVideo.duration > 0 && currentVideo.duration - currentVideo.currentTime <= 1)) {
                        console.log(`✅ 第 ${index} 个视频本体已播完。`);
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }
                }

                if (maxTimeout > 600) { 
                    console.warn(`🚨 监测超时跳过。`);
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 3000); 
        });
    }
})();
