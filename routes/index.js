const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//sms
/*
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '7a234839',
  apiSecret: 'IUvKsVmdNDgp4K24'
})
router.get('/sendsms',function(req,res){


const from = 'Anurag'
const to = '917992275873'
const text = 'hi bawli gand passport ban gaya'

nexmo.message.sendSms(from, to, text)
console.log('message sent')
});
//sms
*/


// Welcome Page
router.get('/',function(req,res){

  res.sendFile('home.html', {root: __dirname })

});
//router.get('/', (req, res) => res.render('home'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);


router.get('/add', (req, res) => {
	if(req.user){
	res.render('add');
}
else
{
req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
}

	
});
router.get('/index1', (req, res) => {
	 //if(req.user){
	res.render('index1');
 //}
});
const User1 = require('../models/user1');

router.get('/add1', (req, res) => {

	//let items=User1.find({title:'APNI KHETI'},(err,items)=>{
		if(req.user){
		let items=User1.find({name:req.user.name},(err,items)=>{
			//let items=User1.find({},(err,items)=>{
		if(err){
			console.log(err);
			return;
		}
		res.render('add1',{items:items});
	})
	}
	else
	{
		req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
	}
});

router.get('/allblogs', (req, res) => {

	//let items=User1.find({title:'APNI KHETI'},(err,items)=>{
		let items=User1.find({},(err,items)=>{
		if(err){
			console.log(err);
			return;
		}
		res.render('allblogs',{items:items});
	})
});

//edit
router.get('/edit/:id',function(req,res){
  let items= User1.findById(req.params.id,function(err,items){
   	//console.log(req.params.id);
   //	
     res.render('edit',{
       items:items
     });
    // console.log(items.title);
     // console.log(items.subject);


   });
});
//delete
//router.get('/user/delete/:id',function(req,res){
	
router.get('/user/delete/:id', function(req, res){
	User1.remove({_id: req.params.id}, 
	   function(err){
		if(err) res.json(err);
		else    res.redirect('/add1');
	});
});


router.get('/welcome', (req, res) => {
	 //if(req.user){
	res.render('welcome');
 //}
});
module.exports = router;