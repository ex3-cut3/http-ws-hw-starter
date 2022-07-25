import {Comment} from './models/comment';

class CommentCreator {
  getComment(message: string, data = {}): Comment {
    return {
      message,
      data
    };
  }
}

export default CommentCreator;