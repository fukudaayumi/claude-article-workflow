figma.showUI(__html__, { width: 440, height: 560 });

async function loadFonts(textNode) {
  if (textNode.fontName === figma.mixed) {
    const fonts = new Set();
    for (let i = 0; i < textNode.characters.length; i++) {
      fonts.add(JSON.stringify(textNode.getRangeFontName(i, i + 1)));
    }
    for (const fontStr of fonts) {
      await figma.loadFontAsync(JSON.parse(fontStr));
    }
  } else {
    await figma.loadFontAsync(textNode.fontName);
  }
}

async function createBanner(articleNo, bannerType, data) {
  const page = figma.currentPage;
  const template = page.findOne(
    (n) => n.name === bannerType && n.type === 'FRAME'
  );
  if (!template) throw new Error(`「${bannerType}」フレームが見つかりません`);

  const clone = template.clone();
  clone.name = data.frameName || `${bannerType}_${articleNo}`;

  const allFrames = page.children.filter((n) => n.type === 'FRAME');
  const bottomY = allFrames.reduce((max, f) => {
    const bottom = f.y + f.height;
    return bottom > max ? bottom : max;
  }, 0);
  clone.x = 0;
  clone.y = bottomY + 100;

  if (bannerType === 'タイトルバナー') {
    const titleNode = clone.findOne(
      (n) => n.name === '[write]記事タイトル' && n.type === 'TEXT'
    );
    if (titleNode && data.title) {
      await loadFonts(titleNode);
      titleNode.characters = data.title;
    }
  } else {
    const listTitleNode = clone.findOne(
      (n) => n.name === '[write]リストタイトル' && n.type === 'TEXT'
    );
    if (listTitleNode && data.listTitle) {
      await loadFonts(listTitleNode);
      listTitleNode.characters = data.listTitle;
    }

    const itemNodes = clone.findAll(
      (n) => n.name === '[write]アイテム' && n.type === 'TEXT'
    );
    for (let i = 0; i < itemNodes.length; i++) {
      if (data.items && data.items[i]) {
        await loadFonts(itemNodes[i]);
        itemNodes[i].characters = data.items[i];
      } else {
        const parentFrame = itemNodes[i].parent;
        if (parentFrame) parentFrame.visible = false;
      }
    }
  }

  return clone;
}

async function exportBanner(articleNo, clone, frameName) {
  const bytes = await clone.exportAsync({
    format: 'PNG',
    constraint: { type: 'SCALE', value: 2 },
  });
  // Uint8Array をそのまま UI に渡す（base64変換はUI側で行う）
  figma.ui.postMessage({ type: 'save-image', articleNo, frameName, pngData: Array.from(bytes) });
}

figma.ui.onmessage = async (msg) => {
  // 手動入力で1枚作成
  if (msg.type === 'create-banner') {
    const { articleNo, bannerType, title, listTitle, items } = msg;
    try {
      const clone = await createBanner(articleNo, bannerType, { title, listTitle, items });
      figma.currentPage.selection = [clone];
      figma.viewport.scrollAndZoomIntoView([clone]);
      figma.ui.postMessage({
        type: 'success',
        message: `記事${articleNo}の「${bannerType}」を作成しました`,
      });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: e.message });
    }
  }

  // JSONから一括作成（＋エクスポート）
  if (msg.type === 'create-bulk') {
    const { json } = msg;
    let data;
    try {
      data = JSON.parse(json);
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: 'JSONの形式が正しくありません' });
      return;
    }

    const { articleNo, banners } = data;
    if (!articleNo || !Array.isArray(banners)) {
      figma.ui.postMessage({ type: 'error', message: 'articleNo と banners が必要です' });
      return;
    }

    const created = [];
    for (const banner of banners) {
      try {
        const clone = await createBanner(articleNo, banner.type, banner);
        created.push({ clone, frameName: banner.frameName });
      } catch (e) {
        figma.ui.postMessage({ type: 'error', message: e.message });
        return;
      }
    }

    figma.currentPage.selection = created.map(c => c.clone);
    figma.viewport.scrollAndZoomIntoView(created.map(c => c.clone));

    figma.ui.postMessage({
      type: 'success',
      message: `記事${articleNo}のバナーを${created.length}枚作成しました。画像を書き出し中...`,
    });

    // PNG書き出し（サーバーが起動している場合のみ）
    for (const { clone, frameName } of created) {
      if (frameName) {
        await exportBanner(articleNo, clone, frameName);
      }
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
