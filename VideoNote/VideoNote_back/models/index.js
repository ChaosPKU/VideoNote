var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/videonote' , function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log('connect to videonote mongodb succeed!');
  }
});
//连接数据库
//用户 model
var UserSchema = new Schema({
    userID: {type: String, unique: true},
    salt: {type: String}, //↓
    hash: {type: String}, //这两个共同存密码
    nickname: {type: String},
    head: {type: String , default:"/img/icon128.png"}, //存头像的path
    mobilephone: {type: String},
    email: {type: String},
    myNotes: [{             //我的笔记
        VideoUrl: {type: String}, //video的url
        VideoTime: {type: Date} //note所在的时间
    }],
    myConcerns: [{              //我的关注
        VideoUrl: {type: String}, //video的url
        VideoTime: {type: Date} //note所在的时间
    }],
    myCollects: [{              //我的收藏
        VideoUrl: {type: String}, //video的url
        VideoTime: {type: Date} //note所在的时间
    }]
});
var UserModel = mongoose.model("User" , UserSchema);
exports.UserModel = UserModel;

//Video model
var VideoSchema = new Schema({
    URL: {type: String , unique: true},
    VideoName: {type: String},
    TotalTime: {type: Date},
    slots: [{
        slotIndex: {type: Number},
        relatedUsers: [], //存userID,与本时间段操作相关的userID
        notes: [{
            noteIndex: {type: Number},
            title: {type: String},
            type: {type: Number},
            fromUserID: {type: String},
            time: {type: String},   //方便前端显示
            _time: {type: Number},
            abstract: {type: String},
            body: {type: String},
            praises: [String],  //这三个数组里存的是执行相关动作的用户的ID
            concerns: [String], //↑
            collects: [String], //↑
            replys:[{
                replyIndex: {type: Number},
                fromUserID: {type: String},
                time: {type: String},
                _time: {type: Number},
                body: {type: String},
                praises: [String],
                comments: [{
                    fromUserID: {type: String},
                    toUserID: {type: String},
                    time: {type: String},
                    _time: {type: Number},
                    body: {type: String}
                }]
            }]
        }]
    }]
});
var VideoModel = mongoose.model("Video" , VideoSchema);
exports.VideoModel = VideoModel;