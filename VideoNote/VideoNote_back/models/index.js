var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/coursehelper' , function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log('connect to coursehelper mongodb succeed!');
  }
});
//连接数据库
//用户 model
var UserSchema = new Schema({
    userID: {type: String, unique: true},
    salt: {type: String}, //↓
    hash: {type: String}, //这两个共同存密码
    nickname: {type: String},
    role: {type: Number}, //0学生 1老师
    head: {type: String , default:"/img/icon128.png"}, //存头像的path
    mobilephone: {type: String},
    email: {type: String},
    myNotes: [{             //我的笔记
        PDFUrl: {type: String}, //PDF的url
        pageIndex: {type: Number},  //PDF的某一页
        noteIndex: {type: Number}   //某一页上的某一个
    }],
    myConcerns: [{              //我的关注
        PDFUrl: {type: String}, 
        pageIndex: {type: Number},  
        noteIndex: {type: Number}   
    }],
    myCollects: [{              //我的收藏
        PDFUrl: {type: String}, 
        pageIndex: {type: Number},  
        noteIndex: {type: Number}
    }]
});
var UserModel = mongoose.model("User" , UserSchema);
exports.UserModel = UserModel;

//PDF model
var PDFSchema = new Schema({
    URL: {type: String , unique: true},
    pdfName: {type: String},
    pages: [{
        pageIndex: {type: Number},
        relatedUsers: [], //存userID,与本页操作相关的userID
        notes: [{
            noteIndex: {type: Number},
            title: {type: String},  
            type: {type: Number},
            fromUserID: {type: String}, 
            time: {type: String},   //方便前端显示    
            _time: {type: Number},
            relatedRange: {type: String},   //相关区域
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
var PDFModel = mongoose.model("PDF" , PDFSchema);
exports.PDFModel = PDFModel;