# youtube-shorts-player
Adds video navigation and audio control to youtube shorts videos

## Default / Обычное поведение
![Preview functional](https://i.imgur.com/zF1QCG2.png)

## On hover / При наведении
![Preview functional](https://i.imgur.com/fgmcBr0.png)

## On change video position / При изменении позиции видео
![Preview functional](https://i.imgur.com/QIdI44o.png)

## On speed playback change / При изменении скорости воспроизведения видео
![Preview functional](https://i.imgur.com/V0ABITj.png)

## On volume change / При изменении громкости звука
![Preview functional](https://i.imgur.com/kodP9bs.png)

# Instructions

Install extension [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

### Next, you have 2 ways to install it:

1. Simple (no manual assembly, recommended)
   1. Click [this link](https://raw.githubusercontent.com/aleqsunder/youtube-shorts-player/main/dist/player.user.js) to automatically add the script to tampermonkey (or do it manually by opening the `/dist/player.user.js` file and clicking the raw button)
   2. Save and open or reload page with youtube shorts
2. Manual (build the project yourself from sources)
   1. Clone this repository
   2. Run in console `yarn install` and then `yarn webpack`
   3. Go to the tampermonkey extension interface and create a new script (empty)
   4. Copy the contents of the `/dist/player.user.js` file and paste it into the new script
   5. Select "File" -> "Save" in the top menu

# Инструкция

Установить расширение [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

### Далее у вас есть 2 способа установки:

1. Простой (без ручной сборки, рекомендуется)
   1. Нажать [на данную ссылку](https://raw.githubusercontent.com/aleqsunder/youtube-shorts-player/main/dist/player.user.js) для автоматического добавления скрипта в tampermonkey (или сделать это вручную, открыв файл `/dist/player.user.js` и нажав кнопку raw)
   2. Сохранить и открыть/обновить страницу с youtube shorts
2. Ручной (собрать проект самому из исходников)
   1. Клонируете данный репозиторий
   2. Выполняете в консоли `yarn install` и следом `yarn webpack`
   3. Переходите в интерфейс расширения tampermonkey и создаёте новый скрипт (пустой)
   4. Копируете содержимое файла `/dist/player.user.js` и вставляете в тот самый новый скрипт
   5. В верхнем меню выбираете "Файл" -> "Сохранить"