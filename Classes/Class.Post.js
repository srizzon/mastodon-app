var api = require( 'Assets/js/api' );
var helper = require( 'Assets/js/helper' );
var Observable = require("FuseJS/Observable");

// used in callback functions for reposting and favouriting
// TODO use args.data
var _this = this;

// true while favouriting/reposting/translating
var favouriting = Observable( false );
var reposting = Observable( false );

// var translating = Observable( false );
// var isTranslated = Observable( false );
// var showTranslation = Observable( function() {
// 	return settings.loadSetting( 'showTranslationsButton' );
// } );

var account = this.Parameter.map( function( param ) {
	return param.account;
} );

var status = this.Parameter.map( function( param ) {
	return param.status;
} );

var youtubeLink = Observable('');
// doesn't scroll nicely in a webview, let's wait for a native youtube solution
// this.status.onValueChanged( module, function ( newStatus ) {
// 	youtubeLink.value = helper.getYoutubeLinkFromText( newStatus.content );
// })

var mentions = this.Parameter.map( function( param ) {
	return param.mentions;
} );

var reblogger = this.Parameter.map( function( param ) {
	return param.reblogger;
} );

var isRepost = this.Parameter.map( function( param ) {
	return param.rebloggerID > 0;
} );

var userHasReposted = this.status.map( function( value ) {
	return ( true == value.reblogged );
} );

var userHasFavourited = this.status.map( function( value ) {
	return ( true == value.favourited );
} );

var timeSince = this.status.map( function( value ) {
	return helper.timeSince( value.created_at );
} );

function replyToPost() {

	router.push(
		'write',
		{
			postid: _this.status.value.id,
			mentions: _this.mentions.value,
			firstup: _this.account.value.acct,
			visibility: _this.status.value.visibility,
			contentwarning: _this.status.value.spoiler_text,
			sensitive: _this.status.value.sensitive
		}
	);

}

function rePost( ) {

	reposting.value = true;
	api.rePost( _this.status.value.id, userHasReposted.value ).then( function() {
		reposting.value = false;
		userHasReposted.value = !userHasReposted.value;
	}).catch( function( err ) {
		console.log( 'error in rePost' );
		console.log( err.message );
		reposting.value = false;
	});

}

function favouritePost( ) {

	favouriting.value = true;
	api.favouritePost( _this.status.value.id, userHasFavourited.value ).then( function() {
		favouriting.value = false;
		userHasFavourited.value = !userHasFavourited.value;
	}).catch( function( err ) {
		console.log( 'error in favouritePost' );
		console.log( JSON.stringify( err.message ) );
		favouriting.value = false;
	});

}

function gotoReportScreen() {

	router.push( 'reportcontent', { post: _this.status.value, userid: _this.account.value.id } );

}

// function translatePost() {

// 	if ( !isTranslated.value ) {

// 		translating.value = true;

// 		// backup original post content
// 		originalContentInParagraphs.value = contentInParagraphs.value;
// 		originalContentInWords.value = contentInWords.value;

// 		var translation = require( 'assets/js/translations' );
// 		translation.getTranslation( unprocessedContent )
// 		.then( function( translation ) {

// 			var contentparser	= require( 'assets/js/parse.content.js' );
// 			// TODO this is not working, as cleanContent needs to be called with the whole post object
// 			contentInParagraphs = contentparser.cleanContent( translation.data.translations[0].translatedText );

// 			// TODO translate into clickable words

// 			isTranslated.value = !isTranslated.value;
// 			translating.value = false;

// 		} )
// 		.catch( function( err ) {

// 			api.setError( 'Could not translate toot: ' + err.message );
// 			translating.value = false;

// 		})

// 	}

// }

function gotoPost() {

	router.push( "postcontext", { post: _this.status.value } );

}

function gotoUser() {

	router.push( 'userprofile', { user: _this.account.value } );

}

function gotoReblogger() {

	if ( _this.reblogger.value ) {
		router.push( 'userprofile', { user: _this.reblogger.value } );
	}

}

function wordClicked( args ) {

	if ( args.data.mention ) {

		// TODO fix data to pass
		router.push( "userprofile", { user: {} } );

	} else if ( args.data.hashtag ) {

		router.push( "hashtag", { tag: args.data.tag } );

	} else if ( args.data.link ) {

		var InterApp = require("FuseJS/InterApp");
		InterApp.launchUri( args.data.uri );

	}

}

module.exports = {

	timeSince: timeSince,

	isRepost: isRepost,
	gotoReblogger: gotoReblogger,

	replyToPost: replyToPost,

	rePost: rePost,
	reposting: reposting,
	userHasReposted: userHasReposted,

	favouritePost: favouritePost,
	favouriting: favouriting,
	userHasFavourited: userHasFavourited,

	gotoReportScreen: gotoReportScreen,

	// 	// translating: translating,
	// 	// isTranslated: isTranslated,
	// 	// showTranslation: showTranslation,
	// 	// translatePost: translatePost,

	gotoUser: gotoUser,
	gotoPost: gotoPost,

	wordClicked: wordClicked,

	// youtubeLink: youtubeLink

};
