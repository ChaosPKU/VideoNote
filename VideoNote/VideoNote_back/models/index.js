var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/videonote' , function(err){
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
    head: {type: String , default:"http://182.92.224.53:8801/img/icon128.png"}, //存头像的path
    mobilephone: {type: String},
    email: {type: String},
    myNotes: [{             //我的笔记
        VideoUrl: {type: String}, //video的url
        slotIndex: {type: Number},
        noteIndex: {type: Number}
    }],
    myConcerns: [{              //我的关注
        VideoUrl: {type: String}, //video的url
        slotIndex: {type: Number},
        noteIndex: {type: Number}
    }],
    myCollects: [{              //我的收藏
        VideoUrl: {type: String}, //video的url
        slotIndex: {type: Number},
        noteIndex: {type: Number}
    }],
    myMessages: {             //我的消息
        myNotesMessage: [{              //我的消息
            VideoUrl: {type: String}, //video的url
            slotIndex: {type: Number},
            noteIndex: {type: Number}
        }],
        myConcernsMessage: [{              //我的消息
            VideoUrl: {type: String}, //video的url
            slotIndex: {type: Number},
            noteIndex: {type: Number}
        }]
    }
});
var UserModel = mongoose.model("User" , UserSchema);
exports.UserModel = UserModel;

//Video model
var VideoSchema = new Schema({
    URL: {type: String , unique: true},
    VideoName: {type: String},
    TotalTime: {type: String},
    VideoInfo: {type: String},
    slots: [{
        slotIndex: {type: Number},
        relatedUsers: [], //存userID,与本时间段操作相关的userID
        notes: [{
            noteIndex: {type: Number},
            title: {type: String},
            fromUserID: {type: String},
            videoTime: {type: String},
            time: {type: String},   //方便前端显示
            _time: {type: Number},
            screenshot: {type: String , default:"/usersUploads/screenshot/default.jpeg"}, //存头像的path
            abstract: {type: String},
            body: {type: String},
            clickCnt: {type: Number}, //点击量
            praises: [String],  //这三个数组里存的是执行相关动作的用户的ID
            concerns: [String], //↑
            collects: [String], //↑
            replys:[{
                replyIndex: {type: Number},
                fromUserID: {type: String},
                time: {type: String},
                _time: {type: Number},
                body: {type: String},
                abstract: {type: String},
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