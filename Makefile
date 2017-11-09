include_dir=build
source=guide.md
title='Serverless 架构应用开发指南'
filename='ebook'


all: html

html:
	pandoc -s guide.md -t html5 -o index.html -c style.css \
		--include-in-header $(include_dir)/head.html \
		--include-before-body $(include_dir)/author.html \
		--include-before-body $(include_dir)/share.html \
		--include-after-body $(include_dir)/stats.html \
		--title-prefix $(title) \
		--normalize \
		--smart \
		--toc


pdf:
	pandoc -s guide.md -o $(filename).pdf \
		--title-prefix $(title) \
		--listings -H template/listings-setup.tex \
		--template=template/template.tex \
		--normalize \
		--smart \
		--toc \
		--latex-engine=`which xelatex`
