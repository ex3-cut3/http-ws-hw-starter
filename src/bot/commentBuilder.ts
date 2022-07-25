import {Comment} from './models/comment';

class CommentBuilder {
  getComment(message: string, data = {}): Comment {
    return {
      message,
      data
    };
  }
}

export default CommentBuilder;