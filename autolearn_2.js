(async function() {
    // 1. 获取所有的视频封面 (基于截图1中的 figure 标签)
    // 这里使用了属性选择器，适配它复杂的 Tailwind CSS 类名
    const videoItems = document.querySelectorAll('figure[class*="cursor-pointer"]');
    if (videoItems.length === 0) {
        console.error("没有找到视频封面，请确认页面是否完全加载！");
        return;
    }

    console.log(`共识别到 ${videoItems.length} 个视频，准备开始无脑按顺序播放...`);

    for (let i = 0; i < videoItems.length; i++) {
        const currentItem = videoItems[i];

        // 2. 滚动到当前视频并点击
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(1500);

        console.log(`▶️ 正在打开第 ${i + 1} 个视频...`);
        currentItem.click();
        
        // 给弹窗和视频加载留出足够的时间
        await sleep(4000); 

        // 3. 寻找视频元素并监听播放结束
        console.log("⏳ 正在等待视频播放完毕，请挂机...");
        await watchVideoUntilEnd(i + 1);

        // 4. 视频看完了，寻找并点击关闭按钮 (基于截图2的 button)
        console.log(`✅ 第 ${i + 1} 个视频结束，尝试关闭弹窗...`);
        // 使用模糊匹配类名的方式寻找关闭按钮
        const closeBtn = document.querySelector('button[class*="bg-white"][class*="h-10"]');
        if (closeBtn) {
            closeBtn.click();
        } else {
            // 如果没找到特征按钮，尝试模拟按 ESC 键退出弹窗
            console.log("未找到特定关闭按钮，尝试按 ESC 关闭...");
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
        }

        // 关掉后休息几秒，再点下一个
        await sleep(3000);
    }

    console.log("🎉 所有界面的视频已全部轮询播放完毕！");

    // ================= 辅助函数 =================

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 核心逻辑：死盯 video 标签直到它播完
    function watchVideoUntilEnd(index) {
        return new Promise((resolve) => {
            let notFoundCount = 0;
            
            const checkInterval = setInterval(() => {
                const videoEl = document.querySelector('video');

                if (videoEl) {
                    notFoundCount = 0; // 找到了就重置计数
                    
                    // 强制静音，防止吵到你
                    videoEl.muted = true;

                    // 如果视频暂停了且没播完，强行让它继续播
                    if (videoEl.paused && videoEl.currentTime < videoEl.duration) {
                        videoEl.play().catch(() => console.log("尝试自动播放被拦截"));
                    }

                    // 判断视频是否已经播到了最后
                    if (videoEl.ended || (videoEl.duration > 0 && videoEl.currentTime >= videoEl.duration - 1)) { // 留1秒容错
                        clearInterval(checkInterval);
                        resolve();
                    }
                } else {
                    notFoundCount++;
                    // 如果连续 15 秒 (5次 * 3秒) 都找不到 video 标签，可能加载卡死了
                    if (notFoundCount >= 5) {
                        console.warn(`⚠️ 第 ${index} 个视频似乎无法加载视频流，准备跳过...`);
                        clearInterval(checkInterval);
                        resolve(); // 放行，去点下一个
                    }
                }
            }, 3000); // 每隔 3 秒检查一次视频进度
        });
    }
})();
