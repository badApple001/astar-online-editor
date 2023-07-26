
export class HtmlUtils {

    public static EnableDropFile(dropHandler: Laya.Handler) {
        dropHandler.once = false;
        function dragEnter(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function dragOver(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function drop(e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            var _type = file.type;
            if (_type.indexOf('image') > -1) {
                var dataURL = URL.createObjectURL(file);
                var img = new Image;
                img.src = dataURL;
                var fileName = file.name;
                img.addEventListener("load", () => {
                    let tex2d = new Laya.Texture2D();
                    tex2d.loadImageSource(img);
                    setTimeout(() => {
                        let texture = Laya.Texture.create(tex2d, 0, 0, tex2d.width, tex2d.height);
                        Laya.loader.cacheRes(fileName, texture);
                        Laya.Loader.loadedMap[fileName] = texture;
                        dropHandler && dropHandler.runWith(fileName);
                    }, 100);
                })
            } else if (_type.indexOf('json') > -1) {
                console.log('文件：' + file.name);
                var reader = new FileReader();
                reader.onload = e => {
                    if (typeof reader.result == "string")
                        dropHandler.runWith(JSON.parse(reader.result));
                };
                reader.readAsText(file)
            } else {
                // 粗略处理
                console.log('文件：' + file.name);
            }
        }
        const dropBox = document;
        dropBox.addEventListener('dragenter', dragEnter, false);
        dropBox.addEventListener('dragover', dragOver, false);
        dropBox.addEventListener('drop', drop, false);
    }

    public static DownloadTextFile(text: string, name: string) {
        const elementA = document.createElement('a');
        elementA.download = name;
        elementA.style.display = 'none';
        const blob = new Blob([text]);
        elementA.href = URL.createObjectURL(blob);
        document.body.appendChild(elementA);
        elementA.click();
        document.body.removeChild(elementA);
    }

    // https://github.com/badApple001/astar-online-editor/raw/main/AStartSource/bin/astar_lib.zip
    public static DownloadZip(url: string, name: string) {
        window.open(url);
        // fetch(url)
        //     .then(function (res) {
        //         res.blob().then(blob => {
        //             // 获取heads中的filename文件名
        //             let downloadElement = document.createElement('a');
        //             // 创建下载的链接
        //             let href = window.URL.createObjectURL(blob);
        //             downloadElement.href = href;
        //             // 下载后文件名
        //             downloadElement.download = name;
        //             document.body.appendChild(downloadElement);
        //             // 点击下载
        //             downloadElement.click();
        //             // 下载完成移除元素
        //             document.body.removeChild(downloadElement);
        //             // 释放掉blob对象
        //             window.URL.revokeObjectURL(href);
        //         });
        //     });
    }
}