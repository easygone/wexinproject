// components/removeList/removeList.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Component({
  /**
   * remove-list
   */
  properties: {
    messageId : String,
    projectId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userMessage:{},
    projectMessage : {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleDelMessage(){
      wx.showModal({
        title: '提示信息',
        content: '删除消息',
        confirmText: '删除',
        success:(res)=>{
          if (res.confirm) {
            this.removeMessage();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    handleAddFriend(){
      wx.showModal({
        title: '提示信息',
        content: '申请好友',
        confirmText: '同意',
        success: (res) => {
          if (res.confirm) {
            db.collection('project').doc(this.data.projectId).update({
              data : {
                TeamList: _.unshift(this.data.messageId)
              }
            }).then((res)=>{
              console.log(123)
              wx.cloud.callFunction({
                name: 'update',
                data: {
                  collection: 'users',
                  doc: this.data.messageId,
                  data: {
                    joinList: _.unshift(this.data.messageId)
                  }
                }
              }).then((res) => {

              });

            }); 
            
            this.removeMessage();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    removeMessage(){
      db.collection('messagep').where({
        userId: app.userInfo._id,
        projectId:projectId
      }).get().then((res) => {
        let list = res.data[0].list;
        list = list.filter((val, i) => {
          return val != this.data.messageId
        });
        wx.cloud.callFunction({
          name: 'update',
          data: {
            collection: 'messagep',
            where: {
              userId: app.userInfo._id, 
              projectId: projectId
            },
            data: {
              list
            }
          }
        }).then((res) => {
          this.triggerEvent('myevent', list);
        });
      });
    }
  },
  lifetimes: {
    attached: function () {
      db.collection('users').doc(this.data.messageId).field({
        userPhoto : true,
        nickName : true
      }).get().then((res)=>{
          
        this.setData({
          userMessage : res.data
        });

      });
    }
  }
})
