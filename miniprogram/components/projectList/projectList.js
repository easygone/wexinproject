// components/removeList/removeList.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Component({
  /**
   * remove-list
   */
  properties: {
    messageId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    projectMessage: {},
    ismyself: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    exitTeam() {
      db.collection('users').doc(app.userInfo._id).get().then((res) => {
        let joinList = res.data.joinList
        joinList = joinList.filter((val, i) => {
          return val != this.data.messageId
        });
        db.collection('users').doc(app.userInfo._id).update({
          data: {
            joinList: joinList
          }


        }).then((res) => {
          db.collection('project').doc(this.data.messageId).get().then((res) => {
            let TeamList = res.data.TeamList
            TeamList = TeamList.filter((val, i) => {
              return val != app.userInfo._id
            });
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'project',
                doc: this.data.messageId,
                data: {
                  TeamList: TeamList
                }
              }
            }).then((res) => {
              wx.showToast({
                title: '已经退出'

              })
            })
          })
        })
      })
    },
    dismissTeam() {
      db.collection('users').doc(app.userInfo._id).get().then((res) => {
        let joinList = res.data.joinList
        joinList = joinList.filter((val, i) => {
          return val != this.data.messageId
        });
        db.collection('users').doc(app.userInfo._id).update({
          data: {
            joinList: joinList
          }
        }).then((res) => {
          db.collection('project').doc(this.data.messageId).get().then((res) => {
            let TeamList = res.data.TeamList
            for (var i = 0; i < TeamList.length; i++) {
              db.collection('users').doc(TeamList[i]).get().then((res) => {
                let joinList2 = res.data.joinList
                joinList2 = joinList2.filter((val, i) => {
                  return val != this.data.messageId
                });
                wx.cloud.callFunction({
                  name: 'update',
                  data: {
                    collection: 'users',
                    doc: TeamList[i],
                    data: {
                      joinList: joinList2
                    }
                  }
              }).then((res) => {
                db.collection('project').doc(this.data.messageId).remove().then((res) => {
                  wx.showToast({
                    title: '已经退出'
                  })
                })
               
                
            })
              })
            }
          })
      })
      })
  }
  },
  lifetimes: {
    attached: function() {

      db.collection('project').doc(this.data.messageId).field({
        projectname: true,
        userId: true
      }).get().then((res) => {

        if (res.data.userId == app.userInfo._id) {
          this.setData({
            projectMessage: res.data,
            ismyself: true
          });
        } else {
          this.setData({
            projectMessage: res.data,
            ismyself: false
          });
        }


      });
    }
  }
})