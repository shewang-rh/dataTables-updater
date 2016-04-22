# dataTables-updater
a totally free plugin , instead of Editor (which is not free) of dataTables.js

大家都知道，jquery.dataTables.js 是一个非常好的jquery 表格插件。
他具有分页、扩展事件、很多可选的样式、以及很棒的server端支持。我在开发table应用时，基本不会多考虑，完全使用dataTables。
最近的一个需求，我们希望针对table做更改，即增删改查的"改"。 
再做了一阵子research后，我发现dataTables有一个叫Editor的插件(dataTables.editor.min.js)。是扩展自dataTables，可以绑定起来使用。只要配置哪些字段可以
进行更改，配置好后台的ajax url，就完成了。
我出于对dataTables的信任，大胆的使用了Editor插件。很顺利的完成了我的功能。

可是！程序在半个月后，出问题了。页面总报错。一看，是Editor插件出问题了，我看了Editor的源码，发现开头的逻辑是自下载起15天后过期。




