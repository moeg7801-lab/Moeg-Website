(() => {
    'use strict';
    const root = document.querySelector('.moeg-tv');
    if (!root) return;
    // Add new channels here. Their order is also the continuous playback order.
    const videos = [
        { id: '0QszPBcCZGM', title: 'I Can Tell That We Are Going To Be Friends' },
        { id: 'VrcF1EmcZLg', title: 'People of the Sun' },
        { id: 'ydyJxxNz9Vc', title: 'Sunset Chasing' },
        { id: 'kn6fWeLbFJ0', title: 'Hideout' },
        { id: '3RwyPDQPf48', title: 'Sun Cruiser' }
    ];
    let current = 0;
    let player;
    let ready = false;
    let pendingPlay = false;
    const guide = root.querySelector('.tv-guide');
    const status = root.querySelector('#tv-status');
    const frame = root.querySelector('iframe');
    const autoplay = root.querySelector('#tv-autoplay');
    const number = index => String(index + 1).padStart(2, '0');
    videos.forEach((video, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Play channel ${number(index)}: ${video.title}`);
        const img = document.createElement('img');
        img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
        img.alt = '';
        img.loading = 'lazy';
        const channel = document.createElement('span');
        channel.className = 'tv-guide-number';
        channel.textContent = `CH ${number(index)}`;
        const title = document.createElement('strong');
        title.textContent = video.title;
        button.append(img, channel, title);
        button.addEventListener('click', () => tune(index));
        guide.append(button);
    });
    function update() {
        root.querySelector('#tv-channel-number').textContent = `CH ${number(current)}`;
        root.querySelector('#tv-now-title').textContent = videos[current].title;
        root.querySelector('#tv-watch-link').href = `https://www.youtube.com/watch?v=${videos[current].id}`;
        frame.title = `Moeg TV — ${videos[current].title}`;
        [...guide.children].forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
        status.textContent = `Up next: ${videos[(current + 1) % videos.length].title}.`;
    }
    function tune(index) {
        current = (index + videos.length) % videos.length;
        update();
        if (ready) player.loadVideoById(videos[current].id);
        else {
            pendingPlay = true;
            status.textContent = 'Connecting to Moeg TV… If the player does not load, watch on YouTube below.';
        }
    }
    root.querySelector('#tv-prev').addEventListener('click', () => tune(current - 1));
    root.querySelector('#tv-next').addEventListener('click', () => tune(current + 1));
    update();
    const src = new URL(frame.src);
    if (location.protocol === 'https:' || location.protocol === 'http:') src.searchParams.set('origin', location.origin);
    frame.src = src.href;
    function initialize() {
        if (player) return;
        player = new YT.Player(frame, {
            events: {
                onReady: () => {
                    ready = true;
                    if (pendingPlay) player.loadVideoById(videos[current].id);
                },
                onStateChange: event => {
                    if (event.data === YT.PlayerState.ENDED && autoplay.checked) tune(current + 1);
                    if (event.data === YT.PlayerState.PLAYING) status.textContent = `Up next: ${videos[(current + 1) % videos.length].title}.`;
                },
                onAutoplayBlocked: () => { status.textContent = 'Press play on the TV to keep watching.'; },
                onError: () => { status.textContent = 'This channel could not play. Try CH + or watch this video on YouTube.'; }
            }
        });
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        initialize();
    };
    if (window.YT && window.YT.Player) initialize();
    else {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => { status.textContent = 'Channel controls could not connect. Play the video above or watch on YouTube.'; };
        document.head.append(script);
    }
})();
