<content>
    <a href={ this.link } class="post" each={ opts.posts }>
        <div class="vert-center">
            <div class="arrows-wrapper">
                <div class="arrow-box">&#x25B2;</div>
                <div class="arrow-box">&#x25BC;</div>
            </div>
            <img class="post-image" src={ this.imgSrc } />
            <div class="post-content">
               <h4 class="post-header">{ this.header }</h4>
               <p class="post-line">{ this.content }</p>
            </div>
        </div>
    </a>

    // Javascript goes below

</content>
