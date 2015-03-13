<content>

    <div href={ this.url } class="post" each={ opts.posts }>
        <div class="vert-center">
            <div class="arrows-wrapper">
                <div class="arrow-box upvote" onclick="" > &#x25B2; </div>
                <div class="vote-count">{ this.count }</div>
                <div class="arrow-box downvote" onclick={ downvote } > &#x25BC; </div>
            </div>
            <img class="post-image" src={ this.img } />
            <div class="post-content">
               <h4 class="post-header">{ this.title }</h4>
               <h4 class="post-header"><small>{ this.byline }</small></h4>
               <p class="post-line">{ this.summary }</p>
            </div>
        </div>
    </div>
    <script>
        upvote (e) {
            console.log('clicekd');
        }

        downvote (e) {
            console.log('clicked');
        }
    </script>
</content>
