// defines the namespace
window.App = {  // top level namespace is declared on the window
  Models: {},
  Collections: {},
  Views: {},
  Router: {}
};

// Post model
App.Models.Post = Backbone.Model.extend({
  urlRoot: '/detail/<page_mark>/',
  defaults: {
    header: '',
    post: '',
  },
  validate: function(attrs, options){
    if (!attrs.header){
        alert('Your post must have a header!');
    }
    if (attrs.post.length < 2){
        alert('Your post must have more than one letter!');
    }
  },
  sleep: function(){
    alert(this.get('header') + ' is the title of my post.');
  }
});

// Post view
App.Views.Post = Backbone.View.extend({
  tagName: 'article', // defaults to div if not specified
  //className: 'exampleClass', // optional, can also set multiple like 'exampleClassII'
  //id: 'exampleID', // also optional
  events: {
    'click .edit':   'editPost',
    'click .delete': 'deletePost'
  },
  savePost: function(){
    this.model.save(null, {
        success: function(model, response){
            console.log('successful');
            this.render()
            $("#main").prepend(this.el);

        },
        error: function(model, response){
            console.log('unsuccessful');
        },
        wait: true // wait for the server response before saving
    });
  },
  editPost: function(){
    var newPost = prompt("New post name:", this.model.get('header')); // prompts for new name
    if (!newPost)return;  // no change if user hits cancel
    this.model.set('header', newPost); // sets new name to model
  },
  deletePost: function(){
    this.model.destroy(); // deletes the model when delete button clicked
  },
  newTemplate: _.template($('#postTemplate').html()), // external template
  initialize: function(){
    this.render(); // render is an optional function that defines the logic for rendering a template
    this.model.on('change', this.render, this); // calls render function once name changed
    this.model.on('destroy', this.remove, this); // calls remove function once model deleted
  },
  remove: function(){
    this.$el.remove(); // removes the HTML element from view when delete button clicked/model deleted
  },
  render: function(){
    // the below line represents the code prior to adding the template
    // this.$el.html(this.model.get('name') + ' is ' + this.model.get('color') + ' and says ' + this.model.get('sound'));
    this.$el.html(this.newTemplate(this.model.toJSON())); // calls the template
  }
});

// Post collection
App.Collections.Post = Backbone.Collection.extend({
  model: App.Models.Post,
  url: '/poetry/workshop/',
  parse: function(response){return response.myPoems;}
});

// View for all posts (collection)
App.Views.Posts = Backbone.View.extend({ // plural to distinguish as the view for the collection
  //el: '.page', // Confirm
  tagName: 'ul', // Confirm
  initialize: function(){
    this.collection;
  },
  render: function(){
    this.collection.each(function(Post){
      var postView = new App.Views.Post({model: Post});
      $("#main").prepend(postView.el);
    });
  }
});

// Backbone router
App.Router = Backbone.Router.extend({
  routes: { // sets the routes
    '':         'index', // http://tutorial.com
    'edit/:id': 'edit' // http://tutorial.com/#edit/7
  },
  // the same as we did for click events, we now define function for each route
  index: function(){
    console.log('index route');
  },
  edit: function(id){
    console.log('edit route with id: ' + id);
  }
});

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

App.Views.ModalDisplay = Backbone.View.extend({
    el: '#myPortfolio',
    events: {
        'click #open': 'openModal'
    },
    template: '<h1><button type="button" id="open" class="btn btn-info btn-lg">Create Poem</button></h1>',
    openModal: function() {
        var view = new App.Views.ModalView();
        var modal = new Backbone.BootstrapModal({
            content: view,
            title: 'modal header',
            animate: true,
            okText: 'Submit New Post',
            okCloses: true,
            enterTriggersOk: true
        }).open(function(){
                var poem_text = $('#editable').html();
                $('#show-form').html(poem_text);
                var $form = $('#poem-form');
                var newPostModel = new App.Models.Post();
                newPostModel.set($form.serializeObject());
                var newPostView = new App.Views.Post({model: newPostModel})
                //newPostView.render()
                //$("#main").prepend(newPostView.el);
            });
    },
    render: function() {
        this.$el.html(this.template);
        console.log('main rendered');
        return this;
    }
});

App.Views.ModalView = Backbone.View.extend({
    tagName: 'p',
    template: _.template($('#formTemplate').html()),
    events: {
        'submit form': 'submit'
    },
    render: function() {
        this.$el.html(this.template);
        console.log('modal rendered');
        return this;
    }
});

$(document).ready(function() {

    ////adding individual models to collection
        //var chihuahua = new App.Models.Post({header: 'Sugar', post: 'This this the name of my chihuahua'});
        //var chihuahuaView = new App.Views.Post({model: chihuahua});
        //var postCollection = new App.Collections.Post(); // only need to create the collection once
        //postCollection.add(chihuahua);

    ////adding multiple models to collection////
        var postCollection = new App.Collections.Post([
         {
           header: 'Sugar',
           post: 'That is the name of my chihuahua',
         },
         {
           header: 'Gizmo',
           post: 'That is the name of my beagle'
         }
        ]);
        var postsView = new App.Views.Posts({collection: postCollection});
        postsView.render();

    ////Retrieving models from flask database////
        //postCollection.fetch({
        //    success: function() {
        //        postsView.render();
        //    }
        //})

    ////Bootstrapping flask models on load////
        //var postCollection = new App.Collections.Post();
        //$(function () {
        //    $('.comment').each(function() {
        //        postCollection.add(new App.Models.Post($(this).data()));
        //    });
        //});
        //var postsView = new App.Views.Posts({collection: postCollection});
        //postsView.render()

    var newRouter = new App.Router;
    Backbone.history.start(); // start Backbone history

    var modalDisplayView = new App.Views.ModalDisplay();
    modalDisplayView.render();
});