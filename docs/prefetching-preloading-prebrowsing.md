# 翻译文章(非直译)
当我们讨论前端性能时，联想到的是在服务器上压缩、缓存、gzip静态资源，这样用户能尽快的完成他们的目标
资源预获取是另外一种性能增强技术，我们可以用它告诉浏览器哪些资源用户可能会即将需要-在用户真正需要它们之前
[Patrick Hamann](https://twitter.com/patrickhamann)这样解释：
> 预加载是一种暗示浏览器静态资源确实即将或者可能要用到的方式，一些暗示会在当前页面执行，另外一些可能在其他出现的页面执行
> 作为开发者，我们知道我们的程序表现的比浏览器更好。我们可以通过这种方式告知浏览器哪些是核心静态资源
猜测用户真正需要的实践叫`prebrowsing`。这不仅仅是一门技术，它分成几个不同的技术：`dns-prefetch`, `subresource`, 标准的`prefetch`, `preconnect`和`prerender`
## DNS prefetching
这能通过一个特殊的URL通知客户端哪些静态资源即将被需要，这能告诉浏览器尽快的准备好DNS。话说我们需要从URL`example.com`加载一个资源，比如图片和音频文件。在文档的`<head>`中我们可以这样写：
```HTML
<link rel="dns-prefetch" href="//example.com">
```
然后，我们从这个地址请求一个文件，我们不需要等待DNS查找。这非常有用如果我们通过`<script>`从网络引用不知名的第三方资源
在`Harry Roberts`的[著名前端性能文章](https://csswizardry.com/2013/01/front-end-performance-for-web-designers-and-front-end-developers/#section:dns-prefetching)中，他建议这样用这门技术：
> 这普通的一行将会告诉支持的浏览器开始预获取这个域名的DNS在它真正需要之前。这意味着DNS查找程序会准备好在浏览器命中脚本元素真正发起一个请求。它仅仅给浏览器设置一个小的开始头部
这看起来就是一个微小的性能提升以至于无关紧要，但是这个不是一个必须的示例-[谷歌一直会做一些相近的行为](https://docs.google.com/presentation/d/18zlAdKAxnc51y_kj-6sWLmnjl6TLnaru_WH0LJTjP-o/present?slide=id.g120f70e9a_041)。它会自动预处理DNS（有时甚至会预渲染页面）如果你在地址栏输入域名的很小一部分，因此每个请求都会减少关键的毫秒数。

## Preconnect
像很多的DNS预加载方法，preconnect会解决DNS，但是会导致TCP握手，和额外的TLS会话。它能这样用：
```HTML
<link rel="preconnect" href="https://css-tricks.com">
```
更多的信息，关于处理资源命中[LLya Grigorik写了一个不错的文章](https://www.igvita.com/2015/08/17/eliminating-roundtrips-with-preconnect/)
> 现代浏览器尽可能的预测网站哪些链接即将需要再实际请求发生之前。通过初始化早期的“preconnect”，浏览器可以提前设置必要的sockets，来避免来自于严格路径的实际请求的DNS，TCP和TLS回路的性能消耗。也就是说，现代浏览器越小，越不能为每个和所有的网站预测所有的preconnect进行靠谱的预测。
> 好消息是我们可以-最终-帮助浏览器；我们可以通过新的preconnect提示容器Firefox39和Chrome 46，告诉浏览器哪些sockets我们即将需要，在实际请求初始化之前

## prefetching
如果我们确定一个特殊的资源即将请求，我们可以请求浏览器请求并缓存用于稍后的引用中。举个例子，一个图片或一个脚本，或者其他任何能被浏览器缓存的。
```HTML
<link rel="prefetch" href="image.png">
```
不像DNS预获取，我们的确请求并下载这个资源并存储在缓存中。但是，这依靠一系列的条件，像预获取可以被浏览器忽略。举个例子，一个客户端可能在较慢的网络环境放弃一个大的字体文件请求。火狐会仅仅在[“浏览器闲置”](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ)时预获取资源

像[Bram Stein关于这个事情解释](http://www.bramstein.com/writing/preload-hints-for-web-fonts.html)在它的文章中，这个在webfonts会有巨大的性能收益。同时，字体文件必须等DOM和CSSOM构建之后才能真正下载下来。但是，如果预获取他们，然后性能瓶颈更容易达到。

备注：尽管预获取资源应用很难被测试，谷歌和火狐现在会在网络请求面板展示预获取资源。同时，这也方便记录有没有链接预获取是受同源限制的

## SubResources（看备忘录）
另外一个预获取技术，帮助辨认资源十分有更高的优先级和是否应该被请求在预获取列表前。举个例子，在Chrome和Opera我们可以在文档中添加以下的`head`标签：
```HTML
<link rel="subresource" href="styles.css">
```
[根据网络文档](https://www.chromium.org/spdy/link-headers-and-server-hint/link-rel-subresource)，它像这样工作：
> “LINK rel=subresource”从`LINK rel=prefetch`使用不同的语义提供一个新链接关系类型。当`rel=prefetch`在随后的页面提供一个低优先级下载资源，`rel=subresource`可以尽可能早的在当前页面加载资源。

所以：如果资源在当前页面需要，或则如果尽可能快的需要，然后可能用`subresource`更好一些，而不是使用`prefetch`

> 要点：Andy Davies[讨论](https://css-tricks.com/prefetching-preloading-prebrowsing/#comment-1596735)他们的实际作用情况。它即将被谷歌[移除](https://code.google.com/p/chromium/issues/detail?id=581840)

## Prerendering pages
这是核心的选项，像`prerender`给我们能力先假装所有的必要文档资源，比如：
```HTML
<link rel="prerender" href="https://css-tricks.com">
```
Steve Souders写了[关于这个技术非常棒的解释](http://www.stevesouders.com/blog/2013/11/07/prebrowsing/):
> 这像在隐藏的tab打开一个URL-所有的资源下载，DOM创建，页面绘制，css生效，javascript执行，等等。如果用户导航到一个特殊的`href`，然后隐藏的页面交换成视图并以及加载出现。谷歌搜索在相同的Instang Pages已经有这个特性好多年了。微软最近也声明他们也即将同样使用prerender在IE11中的Bing。

但是注意！你应该确认用户一定会点击那个连接，否则客户端下载所有的必要的资源来渲染页面在没有任何理由的情况下。

Souders 接着说：
> 任何一个预言工作，都有预言错误的风险。如果预言非常昂贵（像从其他进程偷取CPU，消耗电池，或者浪费频率）然后担心被验证。这看起来预言用户将要去哪个页面比较困难，但是以下高可信的行为会存在：
> 1. 如果用户搜索了一个明确的结果，结果页很可能会被加载
> 2. 如果用户跳转一个登陆页面，登陆后的页面可能很快即将出现
> 3. 如果用户读一个多页面的文章或带页码的一系列结果，当前页面的下一个有可能是下一个

最后，[页面可见API](http://www.w3.org/TR/page-visibility/)可以用来保证脚本命中在它们真正在用户的屏幕渲染前。
好了，出于这样的设计考量，我们可以讨论将来可能会出现的特性会更有趣一些。

# Future option: Preloading
新特性叫做[preload](https://w3c.github.io/preload/)建议有时最好一直下着一个资源，不用管浏览器是否认为这是一个好主意。不像预加载资源，哪些可以被忽略，预加载中的资源必须被浏览器标记。
```HTML
<link rel="preload" href="image.png">
```
所以，尽管`preloading`在当前并不被所有的浏览器支持，这个想法的背后肯定很有意思。

# 总结
预测用户下一步将要做什么是困难的，这肯定需要很多的解释和测试。但是，性能收益确实值得尝试。我们将实验这些预加载技术，然后我们可以明确地提升用户体验用一种明显的方式。

# 更多的关于prefetching，preloading，prebroswing技术
- [Slides from a talk by Ilya Grigorik called Preconnect, prerender, prefetch](https://docs.google.com/presentation/d/18zlAdKAxnc51y_kj-6sWLmnjl6TLnaru_WH0LJTjP-o/present?slide=id.p19)
- [MDN link prefetching FAQ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ)
- [W3C preload spec](https://w3c.github.io/preload/)
- [Harry Roberts on DNS prefetching](http://csswizardry.com/2013/01/front-end-performance-for-web-designers-and-front-end-developers/#section:dns-prefetching)
- [HTML5 prefetch](https://medium.com/@luisvieira_gmr/html5-prefetch-1e54f6dda15d)
- [Preload hints for webfonts](http://www.bramstein.com/writing/preload-hints-for-web-fonts.html)

# 原文地址
- [prefetching-preloading-prebrowsing en](https://css-tricks.com/prefetching-preloading-prebrowsing/)
