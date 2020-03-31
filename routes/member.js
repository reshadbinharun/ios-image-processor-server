var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var sendEmail = require('./helpers/emailHelpers').sendEmail

/*
Sample routes to add a 'Member' and do email verification
*/
const HASH_COST = 10;

router.post('/add', async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const emailVerified = false;
    const approved = false;
    const verificationToken = crypto({length: 16});
    const passwordHash = await bcrypt.hash(req.body.password, HASH_COST);
    try {
        //TODO: check if email is already in database
        const memberAdded = await req.db.collection("Member").insert({
            name, email, emailVerified, approved
        });
        await req.db.collection("Member").insert({
            email, passwordHash, role, verificationToken
        });
        res.json({
            member: memberAdded
        });
        await sendEmail(email, 'noreply@<domain>.com', '<Subject>', '<Email Body>', verificationToken)
    } catch (e) {
        res.json({
            message: e
        });
    }
    res.send()

});

router.get('verification/:email/:verificationToken', async (req,res)=>{
  const email = req.params.email
  const verificationToken = req.params.verificationToken
  const dbData = await req.db.collection("Member").find({email: email}).project({verificationToken:1,_id:0}).toArray();
  let success = false
  //TODO: assert dbData.length == 1
  if (dbData[0]['verificationToken'] == verificationToken){
    try{
      verificationResult = await req.db.collection("Member").findAndModify({email: email},{cno:1},{"$set":{emailVerified: true}})
      success = true
    } catch(e){
      res.json({
        message: e
      });
    }
  }
  res.json({
    success: success
  });
  res.send()
});

module.exports = router;
