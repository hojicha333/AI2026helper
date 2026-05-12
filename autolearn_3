(async function() {
    console.log("🚀 终极挂课脚本（防504 + 真实鼠标点击破防版）已启动！");

    // 辅助延时函数
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    // 获取所有视频章节
    const videoItems = document.querySelectorAll('.child-item');
    if (videoItems.length === 0) {
        return console.error("❌ 未找到课程列表，请确认是否处于正确的课程目录页面！");
    }

    console.log(`✅ 共扫描到 ${videoItems.length} 个视频节，准备开始自动过滤和播放...`);

    for (let i = 0; i < videoItems.length; i++) {
        const currentItem = videoItems[i];

        // 1. 检查进度，满了直接跳过
        const processElement = currentItem.querySelector('.process');
        const processText = processElement ? processElement.innerText : '';
        if (processText.includes('100%') || processText.includes('已完成')) {
            console.log(`⏭️ 第 ${i + 1} 个视频进度为 [${processText}]，自动跳过！`);
            continue;
        }

        // 2. 找到未完成的视频，滚动并打开
        console.log(`▶️ 正在滚动并打开第 ${i + 1} 个未完成的视频...`);
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(1500); // 等待滚动平滑过渡
        currentItem.click(); // 打开弹窗
        
        // 等待弹窗和视频完全加载（多留点时间给经常 504 的服务器）
        console.log("⏳ 等待 5 秒钟让弹窗和播放器渲染...");
        await sleep(5000); 

        // 尝试点击弹窗内的原生播放按钮（如果存在的话）
        const playBtn = document.querySelector('.video-play');
        if (playBtn) playBtn.click();

        // 3. 双重监听进度（防服务器 504 假死机制）
        console.log("⏳ 正在监测视频播放状态...");
        await waitForProcessToEnd(currentItem, i + 1);

        // 4. 视频看完（或触发超时/防卡死），精确关闭弹窗
        console.log(`☑️ 第 ${i + 1} 个视频流程结束，尝试强制关闭弹窗...`);
        forceCloseModal();
        
        // 留出时间给关闭动画和服务器发送最终记录，再点下一个
        await sleep(3500); 
    }

    console.log("🎉 太棒了，所有任务脚本运行结束！");

    // ================= 核心功能函数 =================

    // 真实鼠标点击模拟（专治 Vue/Ant Design 拦截）
    function forceCloseModal() {
        // 创建一个真实的人类鼠标点击事件（允许事件冒泡）
        const realClick = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        
        // 1. 首选：精确打击 span 图标或 div 容器
        const spanIcon = document.querySelector('.anticon-close');
        const divContainer = document.querySelector('.video-modal-close');
        
        if (spanIcon && spanIcon.offsetParent !== null) {
            console.log("🎯 使用真实鼠标事件点击了 span 图标！");
            spanIcon.dispatchEvent(realClick);
            return;
        }
        if (divContainer && divContainer.offsetParent !== null) {
            console.log("🎯 使用真实鼠标事件点击了 div 容器！");
            divContainer.dispatchEvent(realClick);
            return;
        }

        // 2. 备选：打击遮罩层
        const modalMask = document.querySelector('.video-modal-mask');
        if (modalMask) {
            console.log("🎯 使用真实鼠标事件点击了遮罩层！");
            modalMask.dispatchEvent(realClick);
            return;
        }

        // 3. 终极备选：键盘 ESC
        console.log("🎯 尝试模拟按 ESC 键！");
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'bubbles': true}));
    }

    // 监听进度与防卡死逻辑
    function waitForProcessToEnd(itemNode, index) {
        return new Promise((resolve) => {
            let maxTimeout = 0; 
            
            const checkInterval = setInterval(() => {
                maxTimeout++;

                // 【条件 1】外层文字进度达到了 100%
                const processNode = itemNode.querySelector('.process');
                if (processNode && (processNode.innerText.includes('100%') || processNode.innerText.includes('已完成'))) {
                    console.log(`✅ 第 ${index} 个视频系统进度已更新为完成！`);
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }

                // 【条件 2】视频底层确实播放完毕了
                const videoEl = document.querySelector('video');
                if (videoEl) {
                    videoEl.muted = true; // 强制静音，挂机必备
                    
                    if (videoEl.paused && videoEl.currentTime < videoEl.duration) {
                        videoEl.play().catch(() => {}); // 尝试恢复意外暂停
                    }

                    if (videoEl.ended || (videoEl.duration > 0 && videoEl.duration - videoEl.currentTime <= 1)) {
                        console.warn(`⚠️ 第 ${index} 个视频本体已播完，跳过平台服务器响应判定。`);
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }
                }

                // 【条件 3】由于 504 导致黑屏死机，或者视频太长。强制设定为 30 分钟超时 (600次 * 3秒 = 1800秒 = 30分钟)
                // 这样就算视频崩了，脚本也不会卡死在这里一辈子，半小时后会自动关掉去点下一个
                if (maxTimeout > 600) { 
                    console.warn(`🚨 第 ${index} 个视频监测超时（可能服务器 504 导致黑屏死机），强行跳过。`);
                    clearInterval(checkInterval);
                    resolve();
                }

            }, 3000); // 每 3 秒巡查一次
        });
    }
})();
